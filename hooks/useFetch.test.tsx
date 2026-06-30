import { renderHook, waitFor, act } from "@testing-library/react";
import { useFetch } from "./useFetch";
import axios from "axios";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock axios เพื่อไม่ให้มีการยิง API จริงๆ
vi.mock("axios", () => {
    return {
        default: {
            get: vi.fn(),
            isAxiosError: vi.fn(),
        },
    };
});

describe("useFetch Hook", () => {
    beforeEach(() => {
        // ล้างสถานะการเรียกใช้งาน Mock ในแต่ละเคส
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it("ควรดึงข้อมูลสำเร็จเมื่อ URL ถูกต้อง", async () => {
        const mockData = { id: 1, name: "Test Product" };
        // กำหนดให้ axios.get คืนค่าข้อมูลที่จำลองไว้
        (axios.get as Mock).mockResolvedValue({ data: mockData });

        const { result } = renderHook(() => useFetch("/api/products"));

        // ตรวจสอบว่าเริ่มต้น loading ต้องเป็น true
        expect(result.current.loading).toBe(true);

        // รอจนกว่า loading จะเป็น false
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // ตรวจสอบข้อมูลที่ได้รับ
        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
        // ตรวจสอบว่า axios.get ถูกเรียกด้วย URL ที่ถูกต้อง
        expect(axios.get).toHaveBeenCalledWith("/api/products");
    });

    it("ไม่ควรทำอะไรและปิด loading เมื่อ URL เป็น null", async () => {
        const { result } = renderHook(() => useFetch(null));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
        // axios ไม่ควรถูกเรียก
        expect(axios.get).not.toHaveBeenCalled();
    });

    it("ควรแสดงข้อความ Error เมื่อ API ตอบกลับด้วย Error", async () => {
        const errorMessage = "API error message";

        // จำลอง Axios Error
        (axios.get as Mock).mockRejectedValue({
            response: { data: { message: errorMessage } },
        });
        (axios.isAxiosError as unknown as Mock).mockReturnValue(true);

        const { result } = renderHook(() => useFetch("/api/fail"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe(errorMessage);
    });

    it("ควรเรียกข้อมูลใหม่เมื่อใช้ฟังก์ชัน reFetch", async () => {
        const data1 = { version: 1 };
        const data2 = { version: 2 };

        // กำหนดคืนค่าแตกต่างกันในการเรียกแต่ละครั้ง
        (axios.get as Mock)
            .mockResolvedValueOnce({ data: data1 })
            .mockResolvedValueOnce({ data: data2 });

        const { result } = renderHook(() => useFetch("/api/version"));

        await waitFor(() => {
            expect(result.current.data).toEqual(data1);
        });

        // เรียก reFetch เองแบบ manual
        await act(async () => {
            await result.current.reFetch();
        });

        expect(result.current.data).toEqual(data2);
    });

    it("ควรเรียกข้อมูลเป็นระยะเมื่อกำหนด refreshInterval", async () => {
        // ใช้ Fake Timers เพื่อควบคุมเวลาในการเทส
        vi.useFakeTimers();

        (axios.get as Mock).mockResolvedValue({ data: { success: true } });

        renderHook(() => useFetch("/api/auto-refresh", { refreshInterval: 5000 }));

        // ครั้งแรกตอน mount
        await vi.advanceTimersByTimeAsync(0);
        expect(axios.get).toHaveBeenCalledTimes(1);

        // เลื่อนเวลาไป 5 วินาที
        await vi.advanceTimersByTimeAsync(5000);
        expect(axios.get).toHaveBeenCalledTimes(2);

        // เลื่อนไปอีก 5 วินาที
        await vi.advanceTimersByTimeAsync(5000);
        expect(axios.get).toHaveBeenCalledTimes(3);
    });

    it("ไม่ควรเปลี่ยนสถานะ loading เมื่อใช้ isSilent ใน reFetch", async () => {
        (axios.get as Mock).mockResolvedValue({ data: { updated: true } });

        const { result } = renderHook(() => useFetch("/api/quiet"));

        // รอจนโหลดครั้งแรกเสร็จ
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // เรียก reFetch แบบเงียบๆ (isSilent = true)
        let reFetchPromise: Promise<void>;
        await act(async () => {
            reFetchPromise = result.current.reFetch(true);
            // ระหว่างที่รัน fetchData (isSilent: true) loading จะต้องยังคงเป็น false
            expect(result.current.loading).toBe(false);
        });

        await reFetchPromise!;

        // หลังจากเสร็จสิ้น loading ก็ต้องยังคงเป็น false
        expect(result.current.loading).toBe(false);
    });

});
