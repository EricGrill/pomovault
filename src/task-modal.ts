import type { App } from "obsidian";
import { Modal, Setting } from "obsidian";
import type { AddTaskInput, Priority } from "./types";

const PRIORITIES: Priority[] = ["urgent", "highest", "high", "normal", "low", "lowest"];

export class PomoVaultTaskModal extends Modal {
  private text = "";
  private priority: Priority = "normal";
  private dueDate: string | null = null;
  private startDate: string | null = null;
  private recurring: string | null = null;

  constructor(app: App, private readonly onSubmit: (input: AddTaskInput) => Promise<void>) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Add PomoVault Task" });

    new Setting(contentEl).setName("Task").addText((text) => {
      text.onChange((value) => {
        this.text = value;
      });
    });

    new Setting(contentEl).setName("Priority").addDropdown((dropdown) => {
      for (const value of PRIORITIES) {
        dropdown.addOption(value, value.toUpperCase());
      }
      dropdown.setValue(this.priority);
      dropdown.onChange((value) => {
        this.priority = value as Priority;
      });
    });

    new Setting(contentEl).setName("Due date").addText((text) => {
      text.setPlaceholder("2026-05-04");
      text.inputEl.type = "date";
      text.onChange((value) => {
        this.dueDate = value.trim() || null;
      });
    });

    new Setting(contentEl).setName("Start date").addText((text) => {
      text.setPlaceholder("2026-05-03");
      text.inputEl.type = "date";
      text.onChange((value) => {
        this.startDate = value.trim() || null;
      });
    });

    new Setting(contentEl).setName("Recurring").addText((text) => {
      text.setPlaceholder("every week");
      text.onChange((value) => {
        this.recurring = value.trim() || null;
      });
    });

    new Setting(contentEl).addButton((button) => {
      button.setButtonText("Save task").setCta().onClick(async () => {
        if (!this.text.trim()) return;
        await this.onSubmit({
          text: this.text.trim(),
          priority: this.priority,
          dueDate: this.dueDate,
          startDate: this.startDate,
          recurring: this.recurring,
        });
        this.close();
      });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
