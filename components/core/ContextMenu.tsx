import { useNodes } from "@/contexts/NodeContext";
import { useCallback, useMemo } from "react";
import { NodeType } from "../config/Schema";
import { v4 as uuidv4 } from 'uuid';
import { useGraphContext } from "@/contexts/GraphContext";

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
        <div className="relative group hover:bg-white/20">
            <button className="p-1">{menu.name}</button>
            <div className="absolute left-full top-[-4] hidden group-hover:flex flex-col bg-black/50 p-1">
                {menu.children.map((m: MenuTree, index: number) => <HorizontalMenu key={index} menu={m}/>)}
            </div>
        </div>
    );
}

export default function ContextMenu() {
    const { rightClickPosition } = useNodes();
    const { addNode, scale, canvasPosition } = useGraphContext();

    const spawnNode = useCallback((type: NodeType, executable: boolean) => {
        if (!rightClickPosition) return ;

        addNode({
            id: uuidv4(),
            type,
            position: {
                x: (rightClickPosition.x - canvasPosition.ref.current.x) * scale.ref.current,
                y: (rightClickPosition.y - canvasPosition.ref.current.y) * scale.ref.current
            },
            name: type,
            executable
        });
    }, [addNode, rightClickPosition]);

    const menu = useMemo((): MenuTree => {
        return {
            children: [
                {
                    name: "Fetch",
                    spawn: () => spawnNode(NodeType.FETCH, true)
                },
                {
                    name: "Variables",
                    children: [
                        {
                            name: "Get variable",
                            spawn: () => spawnNode(NodeType.GET, false)
                        },
                        {
                            name: "Set variable",
                            spawn: () => spawnNode(NodeType.SET, true)
                        }
                    ]
                },
                {
                    name: "Conditional",
                    children: [
                        {
                            name: "If",
                            spawn: () => spawnNode(NodeType.CONDITIONAL_IF, false)
                        }
                    ]
                },
                {
                    name: "Math",
                    children: [
                        {
                            name: "Add",
                            spawn: () => spawnNode(NodeType.MATH_ADD, false)
                        },
                        {
                            name: "Sub",
                            spawn: () => spawnNode(NodeType.MATH_SUB, false)
                        },
                        {
                            name: "Mul",
                            spawn: () => spawnNode(NodeType.MATH_MUL, false)
                        },
                        {
                            name: "Div",
                            spawn: () => spawnNode(NodeType.MATH_DIV, false)
                        },
                        {
                            name: "Mod",
                            spawn: () => spawnNode(NodeType.MATH_MOD, false)
                        }
                    ]
                }
            ]
        }
    }, [spawnNode]);

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
