# VSLink Thực nghiệm (offline)

Web chạy buổi thực nghiệm tại trường, trả lời **RQ2**: học từ vựng VSL **có phản hồi tự động** (Mèo chấm và giải thích) so với **chỉ xem video mẫu**.

Code tách từ [VSLink](https://github.com/VSLinkProject/vslink) và dùng lại mô hình ONNX, MediaPipe, phần chấm, Mèo và video mẫu. Các phần Dịch, Ghép câu, Đố vui, Tiến độ, Góp ý và Worker Gemini đã được bỏ.

## Một lượt tham gia (khoảng 20 phút)

| Bước | Màn hình | Web ghi lại |
| --- | --- | --- |
| 0 | Người hướng dẫn nhập mã (F01…) và tên máy; bạn tham gia đọc thông tin rồi tick đồng ý | mã, nhóm G1–G4, máy, trình duyệt |
| 1 | Hướng dẫn: giơ tay → ký → hạ tay, tập một lần với camera (phải thành công mới đi tiếp) | số lần tập, fps |
| 2 | Bài trước: 8 video, chọn nghĩa trong 4 đáp án hoặc "Mình không biết" | đáp án, đúng/sai, thời gian trả lời |
| 3 | Học bộ 1 trong **5 phút** (hết giờ tự chuyển) | mỗi lần ký: hạng, p, top-1/top-5; số lần mở từng từ |
| 4 | 3 câu thang 1–7 | điểm từng câu |
| 5 | Học bộ 2 trong 5 phút với điều kiện còn lại | như bước 3 |
| 6 | 3 câu thang 1–7 | như bước 4 |
| 7 | Bài sau: nhận diện lại 8 video (thứ tự khác) | như bước 2 |
| 8 | Ký lại 8 từ theo tên, không xem mẫu, **không hiện kết quả** | hạng, p, top-1/top-5 |
| 9 | Cảm ơn → người hướng dẫn bấm **Người tiếp theo** | thời gian cả lượt |

Web chỉ đi một chiều, không có nút quay lại hay menu. **Tải lại trang thì làm tiếp đúng bước cũ**, đồng hồ không bị đặt lại.

### Hai điều kiện học: cùng một trang, chỉ khác phần phản hồi

| | Không phản hồi | Có phản hồi |
| --- | --- | --- |
| Video mẫu (0,5×, soi gương) | Có | Có |
| Camera tự tập | Có | Có |
| Chấm Đúng / Gần đúng / Chưa đúng | Ẩn (mô hình vẫn chạy ngầm để ghi số liệu) | Hiện |
| Phần nào khác mẫu (tay trái, tay phải, vị trí, đoạn) | Ẩn | Hiện |
| Mèo nhận xét | Ẩn | Hiện, **chỉ dùng lời soạn sẵn**, không gọi Gemini |

### Chia nhóm

Nhóm tính theo số trong mã: `(số − 1) mod 4 + 1`, nên F01 → G1, F02 → G2, F03 → G3, F04 → G4, F05 → G1… Phát mã theo thứ tự người đến thì 4 nhóm tự đều nhau.

| Nhóm | Học trước | Học sau |
| --- | --- | --- |
| G1 | Bộ A, có phản hồi | Bộ B, không phản hồi |
| G2 | Bộ A, không phản hồi | Bộ B, có phản hồi |
| G3 | Bộ B, có phản hồi | Bộ A, không phản hồi |
| G4 | Bộ B, không phản hồi | Bộ A, có phản hồi |

Mã **T01, T02…** dùng để chạy thử. Dữ liệu vẫn được ghi nhưng có cột `loai_ma = T` để loại khi phân tích. Một mã F đã làm trên một máy thì máy đó không cho làm lại.

### Hai bộ từ (đề xuất, nhóm duyệt lại)

Cả 8 từ đều có video QIPEDC đã được duyệt "Khớp tốt", mô hình xếp hạng 1 với p ≥ 0,93, và không trùng MẸ, SÁCH, ĐỌC. Mỗi bộ có 2 từ một tay và 2 từ hai tay, đều là danh từ và thuộc chủ đề khác nhau. Tổng thời lượng mẫu của hai bộ gần bằng nhau: 8,5 s và 8,6 s.

| Bộ A | Bộ B |
| --- | --- |
| Quả cam (1 tay) | Trứng (1 tay) |
| Giám đốc (1 tay) | Mũ (1 tay) |
| Siêu thị (2 tay) | Ngân hàng (2 tay) |
| Con rùa (2 tay) | Con bò (2 tay) |

Muốn đổi từ, thời gian học, số lần ký lại hoặc câu hỏi thì sửa **`src/lib/thuc-nghiem/cau-hinh.ts`**, chỉ một tệp này.

## Cài đặt lần đầu (người giữ repo)

1. Giải nén `vslink-thuc-nghiem.zip`. Trong GitHub Desktop chọn **File → Add local repository** và trỏ tới thư mục vừa giải nén. App báo chưa phải repo thì bấm **create a repository**, sau đó **Publish repository**. Ở mục Organization chọn **VSLinkProject** và **bỏ tick "Keep this code private"** (GitHub Pages miễn phí cần repo public).
2. Bật Pages: **Settings → Pages → Source: GitHub Actions**. Web sẽ ở `https://vslinkproject.github.io/vslink-thuc-nghiem/`.
3. Tạo Google Sheet nhận dữ liệu: làm theo hướng dẫn ở đầu tệp [`apps-script/Code.gs`](apps-script/Code.gs). Phải là một Sheet **riêng**, không dùng chung Sheet góp ý.
4. Dán link Web app vào **Settings → Secrets and variables → Actions → Variables → `GHI_API`**, rồi chạy lại workflow. Có thể dán thẳng vào `static/cau-hinh.json` → `ghi_api` cũng được.
5. Lúc build, GitHub Actions tự tải 8 video mẫu về (`npm run tai-video`). Nếu QIPEDC chặn, web dùng thẳng link QIPEDC, nên khi đó cần mở **Kiểm tra sẵn sàng** để tải trước video.

## Trước mỗi ca (Người 2)

1. Mở `…/vslink-thuc-nghiem/quan-tri/` trên từng laptop, đặt tên máy M1–M4.
2. Bấm **Kiểm tra sẵn sàng**: mô hình, MediaPipe, 8 video và Google Sheet phải đều xanh. Làm bước này khi còn wifi.
3. Mở `…/vslink-thuc-nghiem/` và cho phép camera một lần.
4. Cuối mỗi ngày bấm **Tải CSV** ở trang Quản trị, kể cả khi đã gửi Sheet đủ, để có bản dự phòng.

Mất mạng giữa ca thì không mất dữ liệu: mọi dòng được lưu trong máy trước, có mạng lại thì tự gửi. Trang Quản trị cho biết còn bao nhiêu dòng chưa gửi.

Nếu bạn tham gia muốn dừng, hoặc máy hỏng giữa chừng, bấm **Dừng lượt này (người hướng dẫn)** ở cuối trang và ghi lý do.

## Dữ liệu (mỗi sự kiện một dòng)

| Cột | Ý nghĩa |
| --- | --- |
| `id` | mã dòng duy nhất; Apps Script bỏ dòng trùng khi gửi lại |
| `ma`, `loai_ma`, `nhom`, `may`, `phien` | ai, nhóm nào, máy nào, lượt nào |
| `buoc`, `su_kien` | `nhan-dien` (bài trước/sau), `ky` (lúc học), `ky-lai`, `bo-qua`, `cau-hoi`, `mo-tu`, `tong-ket-tu`, `ket-thuc`, `dung-giua-chung` |
| `lan`, `bo`, `dieu_kien` | phần học 1/2, bộ A/B, `co-phan-hoi` / `khong-phan-hoi` |
| `tu_i`, `tu`, `chon_i`, `chon`, `dung` | từ được hỏi, đáp án chọn (`-1` = Không biết), đúng/sai |
| `hang`, `p`, `top1`, `top5`, `tu_doan` | kết quả mô hình cho từ được yêu cầu |
| `cau`, `diem` | câu thang 1–7 và điểm |
| `ms`, `thoi_luong`, `fps` | thời gian trả lời, độ dài động tác, tốc độ khung hình |

**Phân tích RQ2:**

- **Chỉ số chính:** với mỗi người, tính tỉ lệ đúng ở `buoc = sau`, `su_kien = nhan-dien` cho bộ có phản hồi và bộ không phản hồi. Bộ nào ứng với điều kiện nào thì tra theo `nhom` (bảng ở trên). So sánh hai tỉ lệ bằng t ghép cặp hoặc Wilcoxon.
- **Chỉ số phụ:** tỉ lệ `top1` ở `su_kien = ky-lai`.
- **Lưu ý khi làm sạch:** chỉ giữ `loai_ma = F`. Nếu một câu có 2 dòng (tải lại trang đúng lúc vừa trả lời), lấy dòng đầu tiên. Loại các lượt có `dung-giua-chung`.

## Chạy trên máy

```bash
npm install
npm run dev                         # http://localhost:5173
# chạy thử không cần webcam, bước học chỉ 20 giây:
# http://localhost:5173/?gia-lap=1&nhanh=1
npm test                            # kiểm thử đơn vị
npx playwright test --project=may-tinh   # chạy trọn một lượt bằng "người que"
```
