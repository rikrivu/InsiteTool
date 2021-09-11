import { Events } from '../utils/EventEmitter';
import { LayoutConfigComponentTab } from './AppDashboardModels';

export interface EventEmitterModel {
  events: any;
  dispatch(events: Events[], data: (any | SelectedTabEmitter | ClickOutsideData)[]): void;
  subscribe(event: Events, callback: (data: (any | ClickOutsideData)) => any): void;
  unsubscribe(event: Events): void;
}

export interface ClickOutsideData {
  outsideClicked: boolean;
}

export interface MaximizeEmitter {
  component: string;
  componentID: string;
  emitterName: string;
  loaderPosition?: 'default-loader' | 'br-loader' | 'tr-loader';
}

export interface SelectedTabEmitter extends LayoutConfigComponentTab {
  component: string;
}