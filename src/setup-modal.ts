import type { App } from "obsidian";
import { Modal, Notice, Setting } from "obsidian";
import { validateMarkdownPath } from "./path-policy";

export class PomoVaultSetupModal extends Modal {
  private taskSourcePath = "Tasks.md";

  constructor(app: App, private readonly onSubmit: (taskSourcePath: string) => Promise<void>) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Set up PomoVault" });
    contentEl.createEl("p", {
      text: "Choose the markdown note PomoVault should read tasks from.",
    });

    new Setting(contentEl).setName("Task source file").addText((text) => {
      text.setPlaceholder("Tasks.md").setValue(this.taskSourcePath).onChange((value) => {
        this.taskSourcePath = value;
      });
    });

    new Setting(contentEl).addButton((button) => {
      button.setButtonText("Use task source").setCta().onClick(async () => {
        try {
          const path = validateMarkdownPath(this.taskSourcePath, { label: "Task source path" });
          await this.onSubmit(path);
          this.close();
        } catch (error) {
          new Notice(error instanceof Error ? error.message : "Invalid task source path.");
        }
      });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
