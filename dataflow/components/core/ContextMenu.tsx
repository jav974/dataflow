import { useNodeContext } from "@/dataflow/contexts/NodeContext";
import { useCallback, useMemo } from "react";
import { NodeType } from "../../config/schema";
import { v4 as uuidv4 } from 'uuid';
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import registry from "../nodes/registry";
import { useRefSignalRender } from "react-refsignal";
import { useDashboardContext } from "@/dataflow/contexts/DashboardContext";

interface MenuTree {
    name?: string;
    spawn?: () => void;
    children?: MenuTree[];
}

function HorizontalMenu({menu}: {menu: MenuTree}) {
    if (!menu.name) {
        return menu.children?.map((m: MenuTree, index: number) => <HorizontalMenu key={index} menu={m}/>);
    }

    if (!menu.children?.length) {
        return <div className="hover:bg-white/20 p-1 cursor-pointer" onClick={menu.spawn}>{menu.name}</div>
    }

    return (
        <div className="relative group hover:bg-white/20 min-w-max">
            <button className="p-1">{menu.name}</button>
            <div className="absolute left-full top-[-4] hidden group-hover:flex flex-col bg-black/50 p-1 min-w-max">
                {menu.children.map((m: MenuTree, index: number) => <HorizontalMenu key={index} menu={m}/>)}
            </div>
        </div>
    );
}

export default function ContextMenu() {
    const { rightClickPosition } = useNodeContext();
    const {canvasRect } = useDashboardContext();
    const { addNode, scale, canvasPosition, nodes } = useGraphContext();

    useRefSignalRender([nodes]);

    const spawnNode = useCallback((type: NodeType) => {
        if (!rightClickPosition.current) return ;

        const config = registry.get(type)?.config;

        if (config) {
            addNode({
                ...config,
                id: uuidv4(),
                position: {
                    x: (rightClickPosition.current.x - canvasPosition.current.x - (canvasRect.current?.left ?? 0)) * scale.current,
                    y: (rightClickPosition.current.y - canvasPosition.current.y - (canvasRect.current?.top ?? 0)) * scale.current
                },
            });
        }
    }, [addNode, canvasPosition, canvasRect, rightClickPosition, scale]);

    const createNodeMenuEntry = useCallback((name: string, type: NodeType): MenuTree => {
        return {
            name,
            spawn: () => spawnNode(type)
        }
    }, [spawnNode]);

    const lastUpdated = nodes.lastUpdated;
    const menu = useMemo((): MenuTree => {
        void lastUpdated;
        const hasStartNode = nodes.current.findIndex((ns) => ns.current.type === NodeType.START) !== -1;
        const hasReturnNode = nodes.current.findIndex((ns) => ns.current.type === NodeType.RETURN) !== -1;
        const hasTriggerNode = nodes.current.findIndex((ns) => ns.current.type === NodeType.TRIGGER) !== -1;
        const specialEntries: MenuTree[] = [];

        if (!hasStartNode && !hasTriggerNode) {
            specialEntries.push(createNodeMenuEntry("Start", NodeType.START));
            specialEntries.push(createNodeMenuEntry("Trigger", NodeType.TRIGGER));
        }

        if (!hasReturnNode) {
            specialEntries.push(createNodeMenuEntry("Return", NodeType.RETURN));
        }

        return {
            children: [
                ...specialEntries,
                {
                    name: "Variables",
                    children: [
                        createNodeMenuEntry("Get", NodeType.GET),
                        createNodeMenuEntry("Set", NodeType.SET),
                        createNodeMenuEntry("New", NodeType.NEW),
                        createNodeMenuEntry("Debug", NodeType.DEBUG),
                    ]
                },
                {
                    name: "Conditions",
                    children: [
                        createNodeMenuEntry("If", NodeType.IF),
                        createNodeMenuEntry("Compare", NodeType.COMPARE),
                    ]
                },
                {
                    name: "Logical",
                    children: [
                        createNodeMenuEntry("And ( && )", NodeType.LOGICAL_AND),
                        createNodeMenuEntry("Or ( || )", NodeType.LOGICAL_OR),
                        createNodeMenuEntry("Not ( ! )", NodeType.LOGICAL_NOT),
                    ]
                },
                {
                    name: "Bitwise",
                    children: [
                        createNodeMenuEntry("AND", NodeType.BITWISE_AND),
                        createNodeMenuEntry("OR", NodeType.BITWISE_OR),
                        createNodeMenuEntry("XOR", NodeType.BITWISE_XOR),
                        createNodeMenuEntry("NOT", NodeType.BITWISE_NOT),
                        createNodeMenuEntry("LSHIFT", NodeType.BITWISE_LSHIFT),
                        createNodeMenuEntry("RSHIFT", NodeType.BITWISE_RSHIFT),
                        createNodeMenuEntry("URSHIFT", NodeType.BITWISE_URSHIFT),
                    ]
                },
                {
                    name: "Loops",
                    children: [
                        createNodeMenuEntry("For", NodeType.FOR),
                        createNodeMenuEntry("Foreach", NodeType.FOREACH),
                    ]
                },
                {
                    name: "Math",
                    children: [
                        createNodeMenuEntry("Add", NodeType.MATH_ADD),
                        createNodeMenuEntry("Subtract", NodeType.MATH_SUB),
                        createNodeMenuEntry("Multiply", NodeType.MATH_MUL),
                        createNodeMenuEntry("Divide", NodeType.MATH_DIV),
                        createNodeMenuEntry("Modulo", NodeType.MATH_MOD),
                        createNodeMenuEntry("Power", NodeType.MATH_POW),
                        createNodeMenuEntry("Square root", NodeType.MATH_SQRT),
                    ]
                },
                {
                    name: "String",
                    children: [
                        createNodeMenuEntry("Trim", NodeType.STRING_TRIM),
                        createNodeMenuEntry("Concat", NodeType.STRING_CONCAT),
                        createNodeMenuEntry("Split", NodeType.STRING_SPLIT),
                        createNodeMenuEntry("Replace", NodeType.STRING_REPLACE),
                        createNodeMenuEntry("Length", NodeType.STRING_LENGTH),
                        createNodeMenuEntry("To Upper Case", NodeType.STRING_TO_UPPER),
                        createNodeMenuEntry("To Lower Case", NodeType.STRING_TO_LOWER),
                    ]
                },
                {
                    name: "Array",
                    children: [
                        createNodeMenuEntry("At", NodeType.ARRAY_AT),
                        createNodeMenuEntry("Concat", NodeType.ARRAY_CONCAT),
                        createNodeMenuEntry("Slice", NodeType.ARRAY_SLICE),
                        createNodeMenuEntry("Splice", NodeType.ARRAY_SPLICE),
                        createNodeMenuEntry("Pop", NodeType.ARRAY_POP),
                        createNodeMenuEntry("Push", NodeType.ARRAY_PUSH),
                        createNodeMenuEntry("Shift", NodeType.ARRAY_SHIFT),
                        createNodeMenuEntry("Unshift", NodeType.ARRAY_UNSHIFT),
                        createNodeMenuEntry("Length", NodeType.ARRAY_LENGTH),
                        createNodeMenuEntry("Reverse", NodeType.ARRAY_REVERSE),
                        createNodeMenuEntry("Fill", NodeType.ARRAY_FILL),
                    ]
                },
                {
                    name: "I/O",
                    children: [
                        createNodeMenuEntry("Write", NodeType.IO_WRITE)
                    ]
                },
                createNodeMenuEntry("Break Type", NodeType.BREAK_TYPE),
                createNodeMenuEntry("Delay", NodeType.DELAY),
                createNodeMenuEntry("Sequence", NodeType.SEQUENCE),
                createNodeMenuEntry("Fetch", NodeType.FETCH),
                createNodeMenuEntry("Type", NodeType.TYPEDEF),
            ]
        }
    }, [createNodeMenuEntry, nodes, lastUpdated]);

    useRefSignalRender([rightClickPosition]);

    if (!rightClickPosition.current) {
        return null;
    }

    return (
        <div
            className="absolute bg-black/50 p-1 shadow-lg z-100000 text-white"
            style={{top: rightClickPosition.current.y, left: rightClickPosition.current.x}}
        >
            <HorizontalMenu menu={menu} />
        </div>
    );
}
