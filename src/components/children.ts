import Component from './component';
import { registerComponent } from '../component-utils';

export default class Children extends Component {
  children: Record<string, number> = {};
}
registerComponent(Children);
