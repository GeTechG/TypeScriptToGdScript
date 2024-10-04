import ts from "typescript";

export interface ClassContext {
    extends?: string;
    class_name?: string;
}

export interface MethodContext {
    method_name: string;
    is_lambda?: boolean;
}

export interface FeaturesCollectionsContext {
    Set: boolean;
    ArrayUtils: boolean;
}

export default interface ParseContext {
    project_path: string;
    script_path: string;
    out_directory: string;
    extends?: string;
    class_name?: string;
    const_counter: number;
    class_stack: ClassContext[];
    method_stack: MethodContext[];
    parsed_nodes: Set<ts.Node>;
    features: FeaturesCollectionsContext;
    custom_declares: string[];
    lambdas_nodes: Set<ts.Node>;
    program: ts.Program;
}