import {
    $, AnimatedSprite2D,
    Area2D, CollisionShape2D,
    gdexport, GPUParticles2D, Input, Node2D,
    Signal,
    sn,
    Vector2
} from "godot";

export default class extends Area2D {
    hit: Signal

    @gdexport speed = 400; // How fast the player will move (pixels/sec).
    screen_size: Vector2; // Size of the game window.

    _ready() {
        this.screen_size = this.get_viewport_rect().size;
        this.hide();
    }

    _process(delta: number) {
        let velocity = Vector2.ZERO; // The player's movement vector.
        if (Input.is_action_pressed(sn("move_right"))) {
            velocity.x += 1;
        }
        if (Input.is_action_pressed(sn("move_left"))) {
            velocity.x -= 1;
        }
        if (Input.is_action_pressed(sn("move_down"))) {
            velocity.y += 1;
        }
        if (Input.is_action_pressed(sn("move_up"))) {
            velocity.y -= 1;
        }

        let animatedSprite2D: AnimatedSprite2D = $("AnimatedSprite2D");
        if (velocity.length() > 0) {
            velocity = velocity.normalized().mul(this.speed);
            animatedSprite2D.play();
        } else {
            animatedSprite2D.stop();
        }

        this.position = this.position.add(velocity.mul(delta));
        this.position = this.position.clamp(Vector2.ZERO, this.screen_size)

        if (velocity.x != 0) {
            animatedSprite2D.animation = sn("right");
            animatedSprite2D.flip_v = false;
            $<GPUParticles2D>("Trail").rotation = 0;
            animatedSprite2D.flip_h = velocity.x < 0;
        } else if (velocity.y != 0) {
            animatedSprite2D.animation = sn("up");
            this.rotation = velocity.y > 0 ? Math.PI : 0;
        }
    }

    start(pos: Vector2) {
        this.position = pos;
        this.rotation = 0;
        this.show();
        $<CollisionShape2D>("CollisionShape2D").disabled = false;
    }

    _on_Player_body_entered(_body: Node2D) {
        this.hide(); // Player disappears after being hit.
        this.hit.emit()
        // Must be deferred as we can't change physics properties on a physics callback.
        $<CollisionShape2D>("CollisionShape2D").set_deferred(sn("disabled"), true);
    }
}