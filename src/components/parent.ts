import Component from './component';
import { registerComponent } from '../component-utils';

export default class Parent extends Component {
  entityId: number = -1;
}
registerComponent(Parent);
