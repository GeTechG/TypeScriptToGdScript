// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {SignalConstructor} from "godot";

declare module "godot" {
    export type int = number;

    export const PI: 3.14159265358979;
    export const TAU: 6.28318530717959;
    export const INF = Number.POSITIVE_INFINITY;
    export const NAN =  Number.NaN;

    // Make &"" string literal type
    export function sn(value: string): StringName;

    // Get node by path
    export function $<T extends object>(path: string): T;

    class SignalConstructor<T extends unknown[] = []> {
        /**
         * Connects this signal to the specified [param callable]. Optional [param flags] can be also added to configure the connection's behavior (see [enum Object.ConnectFlags] constants). You can provide additional arguments to the connected [param callable] by using [method Callable.bind].
         *
         * A signal can only be connected once to the same [Callable]. If the signal is already connected, returns [constant ERR_INVALID_PARAMETER] and pushes an error message, unless the signal is connected with [constant Object.CONNECT_REFERENCE_COUNTED]. To prevent this, use [method is_connected] first to check for existing connections.
         *
         * @example
         *
         * for button in $Buttons.get_children():
         *     button.pressed.connect(_on_pressed.bind(button))
         * func _on_pressed(button):
         *     print(button.name, " was pressed")
         * @summary
         *
         *
         */
        connect(callable: Callable, flags: int = 0): int;

        /** Disconnects this signal from the specified [Callable]. If the connection does not exist, generates an error. Use [method is_connected] to make sure that the connection exists. */
        disconnect(callable: Callable): void;

        /** Emits this signal. All [Callable]s connected to this signal will be triggered. This method supports a variable number of arguments, so parameters can be passed as a comma separated list. */
        emit(...args: T): void;

        /**
         * Returns an [Array] of connections for this signal. Each connection is represented as a [Dictionary] that contains three entries:
         *
         * - `signal` is a reference to this signal;
         *
         * - `callable` is a reference to the connected [Callable];
         *
         * - `flags` is a combination of [enum Object.ConnectFlags].
         *
         */
        get_connections(): any[];

        /** Returns the name of this signal. */
        get_name(): StringName;

        /** Returns the object emitting this signal. */
        get_object(): object;

        /** Returns the ID of the object emitting this signal (see [method Object.get_instance_id]). */
        get_object_id(): int;

        /** Returns [code]true[/code] if the specified [Callable] is connected to this signal. */
        is_connected(callable: Callable): boolean;

        /** Returns [code]true[/code] if the signal's name does not exist in its object, or the object is not valid. */
        is_null(): boolean;
    }

    export type Signal<T extends unknown[] = []> = SignalConstructor<T> & Promise<T>;
}