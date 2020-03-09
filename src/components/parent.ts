import Component, { registerComponent } from './component';

export default class Parent extends Component {
  entityId: number = -1;
}
registerComponent(Parent);
