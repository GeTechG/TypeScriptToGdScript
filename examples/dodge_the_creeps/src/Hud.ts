import {$, CanvasLayer, int, Label, Signal, str, Timer} from "godot";

export default class extends CanvasLayer {

    start_game: Signal;

    show_message(message: string) {
        let messageLabel = $<Label>("MessageLabel");
        messageLabel.text = message;
        messageLabel.show();
        $<Timer>("MessageTimer").start();
    }

    async show_game_over() {
        this.show_message("Game Over");
        await $<Timer>("MessageTimer").timeout;
        let messageLabel = $<Label>("MessageLabel");
        messageLabel.text = "Dodge the\nCreeps";
        messageLabel.show();
        await this.get_tree().create_timer(1).timeout;
        $<Label>("StartButton").show();
    }

    update_score(score: int) {
        $<Label>("ScoreLabel").text = str(score);
    }

    _on_StartButton_pressed() {
        $<Label>("StartButton").hide();
        this.start_game.emit();
    }

    _on_MessageTimer_timeout() {
        $<Label>("MessageLabel").hide();
    }
}