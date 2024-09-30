import {
    $,
    AudioStreamPlayer,
    gdexport,
    int,
    Marker2D,
    Node,
    NodePath,
    PackedScene,
    PathFollow2D, randf_range, randi,
    sn,
    Timer, Vector2
} from "godot";
import Hud from "./Hud";
import Player from "./Player";
import Mob from "./Mob";

export default class extends Node {
    @gdexport mob_scene: PackedScene;
    score: int;

    game_over() {
        $<Timer>("ScoreTimer").stop();
        $<Timer>("MobTimer").stop();
        $<Hud>("HUD").show_game_over();
        $<AudioStreamPlayer>("Music").stop();
        $<AudioStreamPlayer>("DeathSound").play();
    }

    new_game() {
        this.get_tree().call_group(sn("mobs"), sn("queue_free"));
        this.score = 0;
        $<Player>("Player").start($<Marker2D>("StartPosition").position);
        $<Timer>("StartTimer").start();
        let hud = $<Hud>("HUD");
        hud.update_score(this.score);
        hud.show_message("Get Ready");
        $<AudioStreamPlayer>("Music").play();
    }

    _on_MobTimer_timeout() {
        // Create a new instance of the Mob scene.
        let mob = this.mob_scene.instantiate() as Mob;

        // Choose a random location on Path2D.
        let mob_spawn_location = this.get_node<PathFollow2D>(new NodePath("MobPath/MobSpawnLocation"));
        mob_spawn_location.progress = randi();

        // Set the mob's direction perpendicular to the path direction.
        let direction = mob_spawn_location.rotation + Math.PI / 2;

        // Set the mob's position to a random location.
        mob.position = mob_spawn_location.position;

        // Add some randomness to the direction.
        direction += randf_range(-Math.PI / 4, Math.PI / 4);
        mob.rotation = direction;

        // Choose the velocity for the mob.
        let velocity = new Vector2(randf_range(150.0, 250.0), 0.0);
        mob.linear_velocity = velocity.rotated(direction);

        // Spawn the mob by adding it to the Main scene.
        this.add_child(mob);
    }

    _on_ScoreTimer_timeout() {
        this.score += 1;
        $<Hud>("HUD").update_score(this.score);
    }

    _on_StartTimer_timeout() {
        $<Timer>("MobTimer").start();
        $<Timer>("ScoreTimer").start();
    }
}