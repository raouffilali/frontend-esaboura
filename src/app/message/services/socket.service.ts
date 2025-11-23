import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { AppService } from '../../app.service';

@Injectable()
export class SocketService {
  config: SocketIoConfig = {
    url: window.appConfig.socketUrl,
    options: { query: { token: localStorage.getItem('accessToken') }, transports: ['websocket'] }
  };
  constructor(private socket: Socket, private appService: AppService) {}
  getMessage(cb) {
    return this.socket.on('new_message', data => {
      cb(data);
    });
  }

  connect() {
    const settings = this.appService.settings;
    this.config = {
      ...this.config,
      url: settings.socketUrl
    };
    this.socket = new Socket(this.config);
    return this.socket.connect();
  }

  disconnect() {
    return this.socket.disconnect();
  }
}
