import { useCallback, useRef } from "react";

export default function useBuffer(size: number) {
    const buffer = useRef<Array<number>>(new Array<number>(size).fill(0));
    const startIndex = useRef(0);
    const endIndex = useRef(0);
    const count = useRef(0);

    const put = useCallback((item: number) => {
        buffer.current[endIndex.current] = item;
        endIndex.current = (endIndex.current + 1) % size;
        
        if (count.current < size) {
            count.current++;
        } else {
            startIndex.current = (startIndex.current + 1) % size;
        }
    }, [size]);

    const addData = useCallback((data: Array<number>) => {
        for (let i = 0; i < data.length; i++) {
            put(data[i]);
        }
    }, [put]);

    const getBuffer = useCallback(() => {
        if (count.current === 0) return [];
        
        const result: number[] = [];
        let currentIndex = startIndex.current;
        
        for (let i = 0; i < count.current; i++) {
            result.push(buffer.current[currentIndex]);
            currentIndex = (currentIndex + 1) % size;
        }
        
        return result;
    }, [size]);

    const clear = useCallback(() => {
        buffer.current.fill(0);
        startIndex.current = 0;
        endIndex.current = 0;
        count.current = 0;
    }, []);

    return { put, addData, getBuffer, clear, count: count.current };
}