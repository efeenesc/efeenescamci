import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

type KeyValuePair = {
  key: string
  value: string
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  valueChanges: Subject<KeyValuePair> = new Subject<KeyValuePair>;
  constructor() { }
  
  get(variableName: string) : string | null {
    return window.localStorage.getItem(variableName);
  }

  set(key: string, value: string) {
    window.localStorage.setItem(key, value);
    const reported: KeyValuePair = { key, value };
    this.valueChanges.next(reported);
  }
}
