require('Scripts/Renderer/Blocks.js');

var blockList = [];
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var trackMove = false;
var trackingBlockIndex;

function redrawBlocks(){
	ctx.clearRect(0, 0, c.width, c.height);
	for(var i = 0; i < blockList.length; i++){
		blockList[i].drawBlock();
	}
}

function touchedBlock(eventArgs, ignoreID){
	for(var i = 0; i < blockList.length; i++){
		if(i == ignoreID){
			i++;
			if(i >= blockList.length){
				return [-1, ""];
			}
		}
		var val = blockList[i].checkTouched(eventArgs);
		if(val) {
			return [i, val];
		}
	}
	return [-1, ""];
}

function click(j){
	(new nestedBlock(j.clientX, j.clientY, 150, 50, 5, "Really REAAAALLY Long Text", "lightblue")).drawBlock();
}

function events(j, eventSource){
	 if (eventSource == "mouseMove" && trackMove){
		if(trackingBlockIndex[0] != -1){
			blockList[trackingBlockIndex[0]].onDrag(j);
		}
		var hoverIndex = touchedBlock(j, trackingBlockIndex[0]);
		if(hoverIndex[0] != -1){
			if(hoverIndex[1] == "childed"){
				blockList[hoverIndex[0]].drawHighlight();
			} else if (hoverIndex[1] == "nested"){
				
			}
		}
	}
	else if(eventSource == "onKeyPress" && trackingBlockIndex[0] != -1){
		blockList[trackingBlockIndex[0]].onKeyPress(j);
	}
	else if(eventSource == "mouseDown"){
		trackMove = true;
		trackingBlockIndex = touchedBlock(j);
	}
	else if (eventSource == "mouseUp"){
		trackMove = false;
		if(trackingBlockIndex[0] == -1){
			click(j);
		}
		else {
			var newParentIndex = touchedBlock(j, trackingBlockIndex[0]);
			if(newParentIndex[0] != -1){
				if(newParentIndex[1] == "childed"){
					blockList[trackingBlockIndex[0]].addParent(newParentIndex[0]);
				} else if (newParentIndex[1] == "nested"){
					blockList[newParentIndex[0]].addNested(trackingBlockIndex[0]);
				}
			}
			else {
				blockList[trackingBlockIndex[0]].removeParent();
			}
			redrawBlocks();
		}
	}
}

function resizeContext(){
	c.width = document.body.clientWidth;
	c.height = document.body.clientHeight;
	redrawBlocks();
}

resizeContext();
window.onresize = function() {return resizeContext()}
c.onmousedown = function(j) { return events(j, "mouseDown"); }
c.onmouseup = function(j) {return events(j, "mouseUp"); }
c.onmousemove = function(j) {return events(j, "mouseMove"); }
c.onkeypress = function(j) {return events(j, "onKeyPress");}
