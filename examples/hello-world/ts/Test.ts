import {gdprint, Node2D} from "godot";

export default class Test extends Node2D {
    static readonly b = 2;
    a = 1;

    override _ready() {
        console.log("Hello, World!", 5, true, this.a, Test.b)
        gdprint("Hello, World!", 5, true, this.a, Test.b)
    }
}