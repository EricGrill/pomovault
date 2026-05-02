export class Notice {
  constructor(public message: string) {}
}

export class Plugin {
  app: any;

  async loadData(): Promise<unknown> {
    return null;
  }

  async saveData(_data: unknown): Promise<void> {}

  registerMarkdownCodeBlockProcessor(): void {}

  addCommand(): void {}

  addSettingTab(): void {}

  registerInterval(_id: number): void {}
}

export class PluginSettingTab {
  containerEl = createMockElement();

  constructor(
    public app: any,
    public plugin: Plugin,
  ) {}

  display(): void {}
}

export class Setting {
  constructor(public containerEl: any) {}

  setName(_name: string): this {
    return this;
  }

  addText(callback: (text: TextComponent) => void): this {
    callback(new TextComponent());
    return this;
  }

  addDropdown(callback: (dropdown: DropdownComponent) => void): this {
    callback(new DropdownComponent());
    return this;
  }

  addToggle(callback: (toggle: ToggleComponent) => void): this {
    callback(new ToggleComponent());
    return this;
  }

  addButton(callback: (button: ButtonComponent) => void): this {
    callback(new ButtonComponent());
    return this;
  }
}

export class Modal {
  contentEl = createMockElement();

  constructor(public app: any) {}

  open(): void {
    this.onOpen();
  }

  close(): void {
    this.onClose();
  }

  onOpen(): void {}

  onClose(): void {}
}

export class TFile {
  extension = "md";

  constructor(public path = "Mock.md") {}
}

export function normalizePath(pathValue: string): string {
  return pathValue.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

class TextComponent {
  inputEl = { type: "text" };

  setPlaceholder(_value: string): this {
    return this;
  }

  setValue(_value: string): this {
    return this;
  }

  onChange(_callback: (value: string) => void | Promise<void>): this {
    return this;
  }
}

class DropdownComponent {
  addOption(_value: string, _label: string): this {
    return this;
  }

  setValue(_value: string): this {
    return this;
  }

  onChange(_callback: (value: string) => void | Promise<void>): this {
    return this;
  }
}

class ToggleComponent {
  setValue(_value: boolean): this {
    return this;
  }

  onChange(_callback: (value: boolean) => void | Promise<void>): this {
    return this;
  }
}

class ButtonComponent {
  setButtonText(_value: string): this {
    return this;
  }

  setCta(): this {
    return this;
  }

  onClick(_callback: () => void | Promise<void>): this {
    return this;
  }
}

function createMockElement(): any {
  return {
    empty() {},
    createEl(_tag: string, _options?: Record<string, unknown>) {
      return createMockElement();
    },
  };
}
