import Component from './component.js';
import { registerComponent } from '../component-utils.js';

export default class Children extends Component {
  children: Record<string, number> = {};
}
registerComponent(Children);
