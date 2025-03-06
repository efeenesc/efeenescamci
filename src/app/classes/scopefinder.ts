export type ScopeFinderType = 'json' | 'plist';

export class ScopeFinder {
  type!: ScopeFinderType;
  theme!: any;
  constructor(_type: ScopeFinderType, _theme: any) {
    this.type = _type;
    this.theme = _theme;
  }

  GetForeground(scope: string): string | undefined {
    if (this.type === 'plist') {
      return this.getForegroundPlist(scope);
    } else {
      return this.getForegroundJSON(scope);
    }
  }

  private getForegroundPlist(scope: string): string | undefined {
    function find(target: any, pname: string): string | undefined {
      if (Array.isArray(target)) {
        for (const list of target) {
          if (list.scope === pname) {
            return list.settings?.foreground ?? list.settings?.background;
          } 
          
          if (list.settings) {
            const result = find(list.settings, pname);
            if (result) return result;
          }
        }
      } else if (typeof target === 'object' && target !== null) {
        return target[pname];
      }
      return undefined;
    }
  
    try {
      const found = find(this.theme.settings, scope);
      return found;
    } catch (error) {
      console.error("Error in getForegroundPlist:", error);
      return undefined;
    }
  }  

  private getForegroundJSON(scope: string): string | undefined {
    try {
      for (const c of this.theme) {
        if (c.scope && c.scope.includes(scope)) {
          
          return c.settings.foreground;
        }
      }
    } catch {
      return;
    }

    return;
  }
}
