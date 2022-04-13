import Component from './component.js';
import { registerComponent } from '../component-utils.js';

export default class Parent extends Component {
  entityId: number = -1;
}
registerComponent(Parent);
