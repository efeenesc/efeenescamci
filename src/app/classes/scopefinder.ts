export type ScopeFinderType = 'json' | 'plist';

export class ScopeFinder {
  type!: ScopeFinderType;
  theme!: any;
  constructor(_type: ScopeFinderType, _theme: any) {
    this.type = _type;
    this.theme = _theme;
  }

  GetForeground(scope: string): string | null {
    if (this.type === 'plist') {
      return this.getForegroundPlist(scope);
    } else {
      return this.getForegroundJSON(scope);
    }
  }

  private getForegroundPlist(scope: string): string | null {
    function find(target: any, pname: string) {
      if (Array.isArray(target)) {
        for (const list of target) {
          if (list['scope'] !== undefined && list['scope'] === pname) {
            return (
              list['settings']['foreground'] ?? list['settings']['background']
            );
          } else if (list['settings'] !== undefined) {
            return find(list['settings'], pname);
          }
        }
      } else {
        if (target[pname] !== undefined) {
          return target[pname];
        }
      }
    }

    let found = null;

    try {
      found = find(this.theme.settings, scope);
    } catch {
      return found;
    }

    return found;
  }

  private getForegroundJSON(scope: string): string | null {
    try {
      for (const c of this.theme) {
        if (c.scope && c.scope.includes(scope)) {
          
          return c.settings.foreground;
        }
      }
    } catch {
      return null;
    }

    return null;
  }
}
