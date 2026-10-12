// CAU HINH THUC NGHIEM OFFLINE — nhom chi can sua tep nay.
//
// Hai bo tu A / B: moi bo 4 tu trong VSL400, deu co video QIPEDC da duyet (Khop tot,
// mo hinh xep hang 1 voi xac suat >= 0,93) va khung xuong mau da kiem chung.
// Can bang: moi bo 2 tu mot tay + 2 tu hai tay, deu la danh tu, khac chu de,
// tong thoi luong dong tac gan bang nhau. Khong trung MẸ / SÁCH / ĐỌC (phan online).
//
// | Bo | Tu (chi so)       | Tay  | p video | Thoi luong mau |
// | A  | Quả cam (258)     | 1    | 0,949   | 2,43 s |
// | A  | Giám đốc (112)    | 1    | 0,940   | 1,77 s |
// | A  | Siêu thị (280)    | 2    | 0,947   | 2,00 s |
// | A  | Con rùa (63)      | 2    | 0,939   | 2,33 s |
// | B  | Trứng (336)       | 1    | 0,935   | 2,07 s |
// | B  | Mũ (195)          | 1    | 0,957   | 2,00 s |
// | B  | Ngân hàng (219)   | 2    | 0,960   | 2,43 s |
// | B  | Con bò (56)       | 2    | 0,948   | 2,13 s |

/** Tang moi lan sua web: hien o goc tren de biet web da cap nhat chua. */
export const PHIEN_BAN = 'bản 4 · che tên từ';

export type MaBo = 'A' | 'B';
export type DieuKien = 'co-phan-hoi' | 'khong-phan-hoi';
export type Nhom = 1 | 2 | 3 | 4;

export const BO_TU: Record<MaBo, number[]> = {
	A: [258, 112, 280, 63],
	B: [336, 195, 219, 56]
};

/** G1..G4: [bo hoc truoc, dieu kien truoc], [bo hoc sau, dieu kien sau]. */
export const KE_HOACH: Record<Nhom, [{ bo: MaBo; dk: DieuKien }, { bo: MaBo; dk: DieuKien }]> = {
	1: [{ bo: 'A', dk: 'co-phan-hoi' }, { bo: 'B', dk: 'khong-phan-hoi' }],
	2: [{ bo: 'A', dk: 'khong-phan-hoi' }, { bo: 'B', dk: 'co-phan-hoi' }],
	3: [{ bo: 'B', dk: 'co-phan-hoi' }, { bo: 'A', dk: 'khong-phan-hoi' }],
	4: [{ bo: 'B', dk: 'khong-phan-hoi' }, { bo: 'A', dk: 'co-phan-hoi' }]
};

/** Thoi gian moi buoc (giay). ?nhanh=1 tren URL -> rut con vai giay de nhom chay thu. */
export const THOI_GIAN = { hoc: 300 } as const;
export const THOI_GIAN_NHANH = { hoc: 20 } as const;

/** Bai sau: so lan ky duoc tinh cho moi tu (lan bi bo vi qua ngan / khong thay tay khong tinh). */
export const SO_LAN_KY_LAI = 1;
/** Bai sau: qua so giay nay chua ky duoc -> hien nut "Bỏ qua từ này". */
export const CHO_BO_QUA_GIAY = 30;

/** 3 cau sau moi bo (thang 1–7). */
export const CAU_HOI = [
	'Mình thấy thích khi học bộ từ này.',
	'Cách học vừa rồi giúp mình biết cần sửa chỗ nào.',
	'Mình tự tin sẽ ký đúng các từ vừa học.'
] as const;

export const NHAN_THANG = { 1: 'Hoàn toàn không đồng ý', 4: 'Phân vân', 7: 'Hoàn toàn đồng ý' } as const;
