class block {
	constructor (x, y, width, height, radius, text, style, type = "block", doUpdate = true) {
		var metrics = ctx.measureText(text);
		if (metrics.width > width - 50){
			width = metrics.width + 50;
		}
		
		this.type = type;
		this.x = x;
		this.y = y;
		this.width = width;
		this._height = height;
		this.radius = radius;
		this._text = text;
		this.style = style;
		this.path = null;
		this.bottomHighlightPath = null;
		this.child = null;
		this.parent = null;
		
		if(doUpdate){
			this.updatePath()
			blockList.push(this);
		}
	}
	
	get height () {
		return this._height;
	}
	
	updatePath () {
		if(this.child != null){
			this.child.y = this.y + this.height;
			this.child.x = this.x;
			this.child.updatePath();
		}
		
		var path = new Path2D();
		var bottomPath = new Path2D();
		path.moveTo(this.x, this.y + this.radius);
		if(this.child == null){
			//left
			path.lineTo(this.x, this.y + this.height - this.radius);
			//left bottom
			path.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			path.lineTo(this.x + this.width - this.radius, this.y + this.height);
			
			bottomPath.moveTo(this.x, this.y + this.height - this.radius);
			//left bottom
			bottomPath.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			bottomPath.lineTo(this.x + this.width - this.radius, this.y + this.height);
			
		}
		else {
			//left
			path.lineTo(this.x, this.y + this.height + this.radius);
			//left bottom
			path.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			path.lineTo(this.x + this.width - this.radius, this.y + this.height);
			
			bottomPath.lineTo(this.x, this.y + this.height + this.radius);
			//left bottom
			bottomPath.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			bottomPath.lineTo(this.x + this.width - this.radius, this.y + this.height);
		}
		//right bottom
		path.arcTo(this.x + this.width, this.y + this.height, this.x + this.width, this.y + this.height - this.radius, this.radius);
		//right
		path.lineTo(this.x + this.width, this.y + this.radius);
		//right top
		path.arcTo(this.x + this.width, this.y, this.x + this.width - this.radius, this.y, this.radius);
		//top
		path.lineTo(this.x + this.radius, this.y);
		//top left
		path.arcTo(this.x, this.y, this.x, this.y + this.radius, this.radius);
		//end
		path.closePath();
		path.fillStyle = this.style
		
		this.bottomHighlightPath = bottomPath;
		this.path = path;
	}

// Events
	
	updateText (eventArgs) {
		if(eventArgs.key === "Backspace" || eventArgs.key === "Delete"){
			this._text = this._text.substr(0, this._text.length - 1);
		}
		else if (eventArgs.key.length == 1){
			this._text += eventArgs.key;
		} else {
			return;
		}
		
		var metrics = ctx.measureText(this._text);
		this.width = metrics.width + 50;
	}
	
	onDrag (eventArgs) {
		this.x = eventArgs.clientX;
		this.y = eventArgs.clientY;
		this.updatePath();
		redrawBlocks();
	}
	
	checkTouched (eventArgs) {
		if(ctx.isPointInPath(this.path, eventArgs.clientX, eventArgs.clientY)){
			return "childed";
		}
		return null;
	}
	
	onKeyPress (eventArgs) {
		this.updateText(eventArgs);
		this.updatePath();
		redrawBlocks();
	}
	
// Parenting functions

	removeParent () {
		 if(this.parent != null){
			this.parent.child = null
			this.parent.updatePath();
			this.parent = null;
			this.updatePath();
		}
	}
	
	addParent (Parent) {
		if(blockList[Parent].child == null){
			if(this.parent) {
				this.parent.child = null
				this.parent.updatePath();
			}
			blockList[Parent].child = this;
			this.parent = blockList[Parent];
			blockList[Parent].updatePath();
		}
		else {
			if(this.parent != null){
				this.parent.updatePath();
			}
		}
	}
		
// Drawing functions 

	drawBlock () {
		ctx.strokeStyle = "black";
		ctx.stroke(this.path);
		ctx.fillStyle = this.style;
		ctx.fill(this.path);
		ctx.strokeText(this._text, this.x + 25, this.y + 10);
	}
	
	drawHighlight () {
		ctx.strokeStyle = "orange";
		ctx.stroke(this.bottomHighlightPath);
	}
}

class nestedBlock extends block {
	constructor (x, y, width, height, radius, text, style) {
		super(x, y, width, height, radius, text, style, "nestedBlock", false);
		this.nestedPath = null;
		this.nestedBlock = null;
		this.nestedParent = null;
		
		this.updatePath()
		blockList.push(this);
	}
	
	get height () {
		if(this.nestedBlock){
			return this._height + this.nestedBlock.outerHeight();
		}
		else {
			return this._height + 25;
		}
	}
	
	innerHeight () {
		if(this.nestedBlock){
			return this.nestedBlock.outerHeight();	
		}
		else {
			return 25
		}
	}
	
	outerHeight () {
		if(this.child){
			return this.height + this.child.outerHeight();
		}
		else {
			return this.height;
		}
	}
	
	addNested (Nested) {
		if(blockList[Nested].nestedParent != null){
			blockList[Nested].nestedParent.nestedBlock = null;
			blockList[Nested].nestedParent.updatePath();
		}
		if(this.nestedBlock != null){
			this.nestedBlock.nestedParent = null;
			this.nestedBlock.updatePath;
		}
		this.nestedBlock = blockList[Nested];
		blockList[Nested].nestedParent = this;
		this.updatePath();
	}
	
	removeParent () {
		 if(this.parent != null){
			this.parent.child = null
			this.parent.updatePath();
			this.parent = null;
			this.updatePath();
		}
		if(this.nestedParent != null){
			this.nestedParent.nestedBlock = null
			this.nestedParent.updatePath();
			this.nestedParent = null;
			this.updatePath();
		}
	}
	
	checkTouched (eventArgs) {
		if(ctx.isPointInPath(this.nestedPath, eventArgs.clientX, eventArgs.clientY)){
			return "nested";
		} else if (ctx.isPointInPath(this.path, eventArgs.clientX, eventArgs.clientY)){
			return "childed";
		}
		return null;
	}
	
	drawNestedHighlight () {
		ctx.strokeStyle = "orange";
		ctx.stroke(this.bottomHighlightPath);
	}
	
	updatePath () {
		if(this.child != null){
			this.child.y = this.y + this.height;
			this.child.x = this.x;
			this.child.updatePath();
		}
		
		if(this.nestedBlock != null){
			this.nestedBlock.y = this.y + this._height / 2;
			this.nestedBlock.x = this.x + (this.radius * 3);
			this.nestedBlock.updatePath();
		}
		
		var path = new Path2D();
		var bottomPath = new Path2D();
		var nestedPath = new Path2D();
		path.moveTo(this.x, this.y + this.radius);
		if(this.child == null){
			//left
			path.lineTo(this.x, this.y + this.height - this.radius);
			//left bottom
			path.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			path.lineTo(this.x + this.width - this.radius, this.y + this.height);
			
			bottomPath.moveTo(this.x, this.y + this.height - this.radius);
			//left bottom
			bottomPath.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			bottomPath.lineTo(this.x + this.width - this.radius, this.y + this.height);
			
		}
		else {
			//left
			path.lineTo(this.x, this.y + this.height + this.radius);
			//left bottom
			path.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			path.lineTo(this.x + this.width - this.radius, this.y + this.height);
			
			bottomPath.lineTo(this.x, this.y + this.height + this.radius);
			//left bottom
			bottomPath.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
			//bottom
			bottomPath.lineTo(this.x + this.width - this.radius, this.y + this.height);
		}
		//right bottom
		path.arcTo(this.x + this.width, this.y + this.height, this.x + this.width, this.y + this.height - this.radius, this.radius);
		//lower right
		path.lineTo(this.x + this.width, this.y + this.radius + (this._height / 2) + this.innerHeight());
		//lower right top
		path.arcTo(this.x + this.width, this.y + (this._height / 2) + this.innerHeight(), this.x + this.width - this.radius, this.y + (this._height / 2) + this.innerHeight(), this.radius);
		nestedPath.moveTo(this.x + this.width - this.radius, this.y + (this._height / 2) + this.innerHeight());
		//lower middle
		path.lineTo(this.x + (this.radius * 4), this.y + (this._height / 2) + this.innerHeight);
		nestedPath.lineTo(this.x + (this.radius * 4), this.y + (this._height / 2) + this.innerHeight());
		
		path.arcTo(this.x + (this.radius * 3), this.y + (this._height / 2) + this.innerHeight(), this.x + (this.radius * 3), this.y + (this._height / 2) + this.innerHeight() - this.radius, this.radius);
		nestedPath.arcTo(this.x + (this.radius * 3), this.y + (this._height / 2) + this.innerHeight(), this.x + (this.radius * 3), this.y + (this._height / 2) + this.innerHeight() - this.radius, this.radius);
		
		path.lineTo(this.x + (this.radius * 3), this.y + (this._height / 2) + this.radius);
		nestedPath.lineTo(this.x + (this.radius * 3), this.y + (this._height / 2) + this.radius);
		
		path.arcTo(this.x + (this.radius * 3), this.y + (this._height / 2), this.x + (this.radius * 4), this.y + (this._height / 2), this.radius);
		nestedPath.arcTo(this.x + (this.radius * 3), this.y + (this._height / 2), this.x + (this.radius * 4), this.y + (this._height / 2), this.radius);
		
		path.lineTo(this.x + this.width - this.radius, this.y + (this._height / 2));
		nestedPath.lineTo(this.x + this.width - this.radius, this.y + (this._height / 2));
		
		path.arcTo(this.x + this.width, this.y + (this._height / 2), this.x + this.width, this.y + (this._height / 2) - this.radius, this.radius);
		nestedPath.arcTo(this.x + this.width, this.y + (this._height / 2), this.x + this.width, this.y + (this._height / 2) - this.radius, this.radius);
		
		//right
		path.lineTo(this.x + this.width, this.y + this.radius);
		//right top
		path.arcTo(this.x + this.width, this.y, this.x + this.width - this.radius, this.y, this.radius);
		//top
		path.lineTo(this.x + this.radius, this.y);
		//top left
		path.arcTo(this.x, this.y, this.x, this.y + this.radius, this.radius);
		//end
		nestedPath.closePath();
		path.closePath();
		path.fillStyle = this.style
		this.path = path;
		this.bottomHighlightPath = bottomPath;
		this.nestedPath = nestedPath;
	}
}