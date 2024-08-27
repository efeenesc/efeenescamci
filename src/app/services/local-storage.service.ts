import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WINDOW } from '../classes/windowinjection';

type KeyValuePair = {
  key: string
  value: string
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  valueChanges: Subject<KeyValuePair> = new Subject<KeyValuePair>();
  private wnd = inject(WINDOW);

  constructor() { }
  
  get(variableName: string) : string | null {
    return this.wnd.localStorage.getItem(variableName);
  }

  set(key: string, value: string) {
    this.wnd.localStorage.setItem(key, value);
    const reported: KeyValuePair = { key, value };
    this.valueChanges.next(reported);
  }
}
