import Component, { registerComponent } from './component';

export default class Children extends Component {
  children: Record<string, number> = {};
}
registerComponent(Children);
