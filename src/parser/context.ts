
export interface ClassContext {
    extends?: string;
    class_name?: string;
}

export interface MethodContext {
    method_name: string;
}

export default interface ParseContext {
    extends?: string;
    class_name?: string;
    const_counter: number;
    class_stack: ClassContext[];
    method_stack: MethodContext[];
}