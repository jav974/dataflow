import { useNodes } from "@/dataflow/contexts/NodeContext";
import { useCallback, useMemo } from "react";
import { NodeConfig, NodeType } from "../../config/schema";
import { v4 as uuidv4 } from 'uuid';
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import registry from "../nodes/registry";

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
    const { rightClickPosition } = useNodes();
    const { addNode, scale, canvasPosition, nodes } = useGraphContext();

    const spawnNode = useCallback((type: NodeType) => {
        if (!rightClickPosition) return ;

        const config = registry.get(type)?.config;

        if (config) {
            addNode({
                ...config,
                id: uuidv4(),
                position: {
                    x: (rightClickPosition.x - canvasPosition.ref.current.x) * scale.ref.current,
                    y: (rightClickPosition.y - canvasPosition.ref.current.y) * scale.ref.current
                },
            });
        }
    }, [addNode, rightClickPosition]);

    const createNodeMenuEntry = useCallback((name: string, type: NodeType): MenuTree => {
        return {
            name,
            spawn: () => spawnNode(type)
        }
    }, [spawnNode]);

    const menu = useMemo((): MenuTree => {
        const hasStartNode = nodes.ref.current.findIndex((n: NodeConfig) => n.type === NodeType.START) !== -1;
        const hasReturnNode = nodes.ref.current.findIndex((n: NodeConfig) => n.type === NodeType.RETURN) !== -1;
        const hasTriggerNode = nodes.ref.current.findIndex((n: NodeConfig) => n.type === NodeType.TRIGGER) !== -1;
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
                createNodeMenuEntry("Sequence", NodeType.SEQUENCE),
                createNodeMenuEntry("Fetch", NodeType.FETCH),
                createNodeMenuEntry("Type", NodeType.TYPEDEF),
            ]
        }
    }, [createNodeMenuEntry, nodes.lastUpdated]);

    if (!rightClickPosition) {
        return null;
    }

    return (
        <div
            className="absolute bg-black/50 p-1 shadow-lg z-100000 text-white"
            style={{top: rightClickPosition.y, left: rightClickPosition.x}}
        >
            <HorizontalMenu menu={menu} />
        </div>
    );
}
