export default function ({ store, route, redirect }) {
    // ตั้งค่า isLoading เป็น true ก่อนที่หน้าจะโหลด
    store.dispatch('setLoading', true);

    // ฟังก์ชันที่ใช้ในการซ่อน Loader และทำการ redirect
    function onRouteChange() {
        store.dispatch('setLoading', false);
    }

    // ใช้ watch เพื่อซ่อน Loader เมื่อการเปลี่ยนหน้าเสร็จ
    store.watch(
        () => route.path,
        onRouteChange,
        { immediate: true }
    );

    // ตัวอย่างการใช้ redirect ถ้ามีเงื่อนไขพิเศษ
    // ตรวจสอบเงื่อนไขที่คุณต้องการก่อน redirect
    if (route.path === '/some-path') {
        redirect('/another-path');
    }
}
