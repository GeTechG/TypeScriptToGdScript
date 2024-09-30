
export interface ClassContext {
    extends?: string;
    class_name?: string;
}

export interface MethodContext {
    method_name: string;
}

export default interface ParseContext {
    project_path: string;
    out_directory: string;
    extends?: string;
    class_name?: string;
    const_counter: number;
    class_stack: ClassContext[];
    method_stack: MethodContext[];
}