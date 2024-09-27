import {gdprint, Node2D} from "godot";

const b = 2;

export default class Test extends Node2D {
    a = 1;

    override _ready() {
        super._ready();
        console.log("Hello, World!", 5, true, this.a, b)
        gdprint("Hello, World!", 5, true, this.a, b)
    }
}