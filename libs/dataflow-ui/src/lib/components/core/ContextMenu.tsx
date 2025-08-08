import { useNodeContext } from "@dataflow-ui/contexts/NodeContext";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NodeType } from "@dataflow-ide/dataflow-core";
import { v4 as uuidv4 } from 'uuid';
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import registry from "../nodes/registry";
import { useRefSignalEffect, useRefSignalRender } from "react-refsignal";
import { useDashboardContext } from "@dataflow-ui/contexts/DashboardContext";
import { SCROLLBAR_STYLE } from "@dataflow-ui/themes/style";

interface MenuTree {
    name?: string;
    spawn?: () => void;
    children?: MenuTree[];
}

// function HorizontalMenu({menu}: {menu: MenuTree}) {
//     if (!menu.name) {
//         return menu.children?.map((m: MenuTree, index: number) => <HorizontalMenu key={index} menu={m}/>);
//     }

//     if (!menu.children?.length) {
//         return <div className="hover:bg-white/20 p-1 cursor-pointer" onClick={menu.spawn}>{menu.name}</div>
//     }

//     return (
//         <div className="relative group hover:bg-white/20 min-w-max">
//             <button className="p-1">{menu.name}</button>
//             <div className="absolute left-full top-[-4px] hidden group-hover:flex flex-col bg-black/50 p-1 min-w-max">
//                 {menu.children.map((m: MenuTree, index: number) => <HorizontalMenu key={index} menu={m}/>)}
//             </div>
//         </div>
//     );
// }

function AccordionMenu({ menu, visible }: { menu: MenuTree, visible: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!menu.name) {
        return (
            <>
                {menu.children?.map((m, index) => (
                    <AccordionMenu key={index} menu={m} visible={visible} />
                ))}
            </>
        );
    }

    const hasChildren = menu.children && menu.children.length > 0;

    const handleFold = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    }, [isOpen]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (menu.spawn) {
            menu.spawn();
        } else {
            handleFold(e);
        }
    }, [handleFold, menu]);

    useEffect(() => {
        if (!visible) setIsOpen(false);
    }, [visible]);

    return (
        <div className="border-b border-gray-700 relative">
            <div
                className={`cursor-pointer flex items-center hover:bg-gray-700`}
                onClick={handleClick}
            >
                {hasChildren && (
                <span className="transform transition-transform text-xs" style={{ rotate: isOpen ? "90deg" : "0deg" }}>
                    ▶
                </span>
                )}
                <span className={`${hasChildren ? 'ml-1 ' : 'ml-4'}`}>{menu.name}</span>
            </div>
            {hasChildren && isOpen && (
                <div className="border-l border-gray-600">
                    {menu.children!.map((child, index) => (
                        <AccordionMenu key={index} menu={child} visible={visible} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ContextMenu() {
    const menuRef = useRef<HTMLDivElement>(null);
    const { rightClickPosition } = useNodeContext();
    const [position, setPosition] = useState<{top: number|undefined, left: number|undefined}>({ top: rightClickPosition.current?.y, left: rightClickPosition.current?.x});
    const { canvasRect } = useDashboardContext();
    const { addNode, scale, canvasPosition, nodes } = useGraphContext();
    const [search, setSearch] = useState<string>("");

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
                        createNodeMenuEntry("Constant", NodeType.CONSTANT),
                        createNodeMenuEntry("Debug", NodeType.DEBUG),
                    ]
                },
                {
                    name: "Objects",
                    children: [
                        createNodeMenuEntry("Get object key", NodeType.OBJECT_GET),
                        createNodeMenuEntry("Set object key", NodeType.OBJECT_SET),
                        createNodeMenuEntry("Remove object key", NodeType.OBJECT_REMOVE),
                    ]
                },
                {
                    name: "Events",
                    children: [
                        createNodeMenuEntry("New", NodeType.NEW_EVENT),
                        createNodeMenuEntry("Call", NodeType.CALL_EVENT),
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
                    name: "Comparison",
                    children: [
                        createNodeMenuEntry("Equal ( == )", NodeType.COMPARE_EQUAL),
                        createNodeMenuEntry("Not equal ( != )", NodeType.COMPARE_NOT_EQUAL),
                        createNodeMenuEntry("Greater than ( > )", NodeType.COMPARE_GREATER_THAN),
                        createNodeMenuEntry("Less than ( < )", NodeType.COMPARE_LESS_THAN),
                        createNodeMenuEntry("Greater than or equal ( >= )", NodeType.COMPARE_GREATER_THAN_OR_EQUAL),
                        createNodeMenuEntry("Less than or equal ( <= )", NodeType.COMPARE_LESS_THAN_OR_EQUAL),
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
                        createNodeMenuEntry("Do/While", NodeType.WHILE),
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

    const [filteredMenu, setFilteredMenu] = useState<MenuTree|null>(menu);

    useRefSignalEffect(() => {
        if (rightClickPosition.current && menuRef.current) {
            const { offsetHeight, offsetWidth } = menuRef.current;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            let top = rightClickPosition.current.y;
            let left = rightClickPosition.current.x;

            if (top + offsetHeight > viewportHeight) {
                top = Math.max(0, viewportHeight - offsetHeight);
            }

            if (left + offsetWidth > viewportWidth) {
                left = Math.max(0, viewportWidth - offsetWidth);
            }

            setPosition({ top, left });
        } else {
            setPosition({top: undefined, left: undefined});
        }
    }, [rightClickPosition]);

    const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const filterMenu = useCallback((fullMenu: MenuTree, terms: string): MenuTree | null => {
        const searchTerms = terms.toLowerCase().split(/\s+/).filter(Boolean);

        const matches = (name?: string): boolean =>
            name ? searchTerms.some(term => name.toLowerCase().includes(term)) : false;

        const filteredChildren = fullMenu.children
            ?.map(child => filterMenu(child, terms))
            .filter((child): child is MenuTree => child !== null);
        
        const matchName = matches(fullMenu.name);

        if (matchName || (filteredChildren && filteredChildren.length > 0)) {
            if (matchName && fullMenu.children && fullMenu.children.length > 0 && (filteredChildren!.length === 0)) {
                return fullMenu;
            }

            return {
                ...fullMenu,
                children: filteredChildren,
            };
        }

        return null;
    }, []);

    useEffect(() => {
        if (!search || search.trim().length === 0) {
            setFilteredMenu(menu);
            return ;
        }

        setFilteredMenu(filterMenu(menu, search.trim()));
    }, [search]);

    const isVisible = position.top !== undefined;

    useEffect(() => {
        if (!isVisible) setSearch("");
    }, [isVisible]);

    return (
        <div
            ref={menuRef}
            id="context-menu"
            className={`${isVisible ? 'visible' : 'hidden'} absolute bg-black/90 p-1 shadow-lg z-1000000 text-white max-h-[400px] overflow-y-auto ${SCROLLBAR_STYLE}`}
            style={position}
        >
            <input type="text" autoComplete="off" className="mb-2 outline-blue-500/50 focus:outline-blue-500 pl-1 pr-1 outline field-sizing-content min-w-[200px]" placeholder="Search nodes" value={search} onChange={handleSearchInput} onClick={(e) => {e.preventDefault(); e.stopPropagation();}}></input>
            {search.trim().length > 0 && filteredMenu && <AccordionMenu menu={filteredMenu} visible={isVisible} />}
            {search.trim().length === 0 && <AccordionMenu menu={menu} visible={isVisible} />}
        </div>
    );
}
