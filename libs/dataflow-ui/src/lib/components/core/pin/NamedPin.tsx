import { useCallback, useMemo, useRef } from "react";
import useHoverable from "@dataflow-ui/hooks/useHoverable";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "@dataflow-ui/components/forms/Input";

interface NamedPinProps {
    id: string;
    value: string;
    removable: boolean;
    orientation?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (data: any, event?: React.BaseSyntheticEvent) => void;
    onRemove?: () => void;
}

export default function NamedPin({id, value, removable, onSubmit, onRemove, orientation = "right"}: NamedPinProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo((): yup.ObjectSchema<yup.AnyObject> => {
        return yup.object({[id]: yup.string().required()});
    }, [id]);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            [id]: value
        }
    });

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    return (
        <FormProvider {...methods}>
            <form
                ref={formRef}
                onSubmit={methods.handleSubmit(onSubmit)}
                onPointerEnter={handleMouseEnter}
                onPointerLeave={handleMouseLeave}
                className={`flex grow ${orientation === 'right' ? 'flex-row-reverse' : ''}`}
            >
                <Input className="grow" name={id} onBlur={onBlur} placeholder={value} orientation={orientation} />
                {removable && <span className={`${isHovered ? '' : 'invisible'} text-red-500 cursor-pointer`} onClick={onRemove}>[x]</span>}
            </form>
        </FormProvider>
    );
}
