import { storiesOf } from '@storybook/angular';
import { withNotes } from '@storybook/addon-notes';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { BlockComponent } from '../app/block/block.component';

storiesOf('Block', module)
  .add('Basic Blocks have a default color', () => ({
    component: BlockComponent,
    props: {
      text: 'Okay, this is cool'
    }
  }));
