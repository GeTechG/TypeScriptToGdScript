import {$, AnimatedSprite2D, RigidBody2D} from "godot";
import * as godot from "godot";

export default class extends RigidBody2D {
    _ready() {
        let animatedSprite2D: AnimatedSprite2D = $("AnimatedSprite2D");
        animatedSprite2D.play();
        let mobTypes = new godot.Array(animatedSprite2D.sprite_frames.get_animation_names());
        animatedSprite2D.animation = mobTypes.pick_random();
    }

    _on_VisibilityNotifier2D_screen_exited() {
        this.queue_free();
    }
}