import React from "react";
import "./coursedetail.css";

export const CourseDetail: React.FC = () => {
  return (
    <div className="course-detail">
      <button 
        className="course-detail-back-btn"
        onClick={() => window.location.href = '/pre-learning-path'}
        title="Quay lại trang tutorial"
      >
        ← Quay lại
      </button>
      <div className="div">
        {/* 2. Thông tin khóa học */}
        <div className="overlap">
          <p className="text-wrapper">Cơ cấu phân bố điểm</p>

          <div className="overlap-group">
            <div className="text-wrapper-2">Quiz</div>
            <div className="text-wrapper-3">15%</div>
            <div className="text-wrapper-4">Homework</div>
            <div className="text-wrapper-5">10%</div>
            <div className="text-wrapper-6">Midterm Exam</div>
            <div className="text-wrapper-7">20%</div>
            <div className="text-wrapper-8">Individual Project</div>
            <div className="text-wrapper-9">Final Exam</div>
            <div className="text-wrapper-10">15%</div>
            <div className="text-wrapper-11">40%</div>
            <div className="rectangle" />
            <div className="rectangle-2" />
            <div className="rectangle-3" />
            <div className="rectangle-4" />
            <div className="rectangle-5" />
          </div>

          <p className="kh-a-h-c-nh-m-m-c-ch">
            <span className="span">K</span>
            <span className="span">
              hóa học nhằm mục đích cung cấp cho sinh viên kiến thức về Hệ thống
              quản lý cơ sở dữ liệu quan hệ như cấu trúc dữ liệu, tổ chức tệp,
              Ngôn ngữ truy vấn có cấu trúc (SQL), quản lý giao dịch, cơ chế
              quản lý truy cập đồng thời, bảo mật và phục hồi dữ liệu sau sự cố,
              tối ưu hóa, phân tích dữ liệu lớn cũng như các câu hỏi về cấu trúc
              tổ chức và phương pháp truy cập.
            </span>
          </p>

          <div className="overlap-2">
            <div className="text-wrapper-12">IS 301 - Database</div>
            <div className="text-wrapper-13">Môn tiên quyết</div>
          </div>

          <div className="overlap-3">
            <div className="text-wrapper-14">Tiếng anh</div>
            <div className="text-wrapper-15">Ngôn ngữ</div>
          </div>

          <div className="overlap-4">
            <div className="text-wrapper-16">Trung bình</div>
            <div className="text-wrapper-17">Độ khó</div>
          </div>

          <div className="overlap-5">
            <div className="text-wrapper-18">51h</div>
            <div className="text-wrapper-15">Thời lượng môn học</div>
          </div>

          <div className="overlap-6">
            <div className="group">
              <div className="overlap-7">
                <div className="rectangle-6" />
                <div className="text-wrapper-19">3 tín chỉ</div>
              </div>
            </div>
            <p className="p"> CMU-IS 401 SAIS - Information System Applications</p>
          </div>

          <div className="overlap-wrapper">
            <div className="overlap-8">
              <div className="text-wrapper-20">Loại đánh giá</div>
              <div className="text-wrapper-21">Phần trăm</div>
            </div>
          </div>
        </div>

        {/* 3. Chương trình học DTU */}
        <div className="overlap-16">
          <div className="rectangle-10" />
          <div className="text-wrapper-27">2</div>
          <div className="text-wrapper-28">Introduction to DBMS</div>
          <div className="rectangle-11" />
          <div className="rectangle-12" />
          <div className="text-wrapper-30"> DDL</div>
          <div className="rectangle-13" />
          <div className="rectangle-14" />
          <div className="text-wrapper-31">DML</div>
          <div className="rectangle-15" />
          <div className="rectangle-16" />
          <div className="text-wrapper-32">Multiple table queries</div>
          <div className="rectangle-17" />
          <div className="text-wrapper-33">Triggers end Stored Procedures</div>
          <div className="rectangle-18" />
          <div className="rectangle-19" />
          <p className="text-wrapper-34">Chương trình khóa học theo DTU</p>
          <div className="rectangle-20" />
          <div className="rectangle-21" />
          <div className="text-wrapper-35">1</div>
          <p className="text-wrapper-36">
            Part I Fundamentals of Database Management Systems (DBMS)
          </p>
          <div className="text-wrapper-37">18 hours</div>
          <div className="rectangle-22" />
          <div className="frame" />
          <div className="rectangle-23" />
          <div className="rectangle-24" />
          <div className="text-wrapper-38">2</div>
          <p className="text-wrapper-39">Part II Data Storage and Big Data Analytics</p>
          <div className="text-wrapper-40">4 hours</div>
          <div className="rectangle-25" />
          <div className="vector-wrapper" />
          <div className="rectangle-26" />
          <div className="rectangle-27" />
          <div className="text-wrapper-41">3</div>
          <p className="text-wrapper-42">Part III Database Administration and Transaction Management</p>
          <div className="text-wrapper-43">11 hours</div>
          <div className="rectangle-28" />
          <div className="img-wrapper" />
          <div className="rectangle-29" />
          <div className="rectangle-30" />
          <div className="text-wrapper-44">4</div>
          <p className="text-wrapper-45">Part IV Database Security and Advanced Data Management</p>
          <div className="text-wrapper-46">12 hours</div>
          <div className="rectangle-31" />
          <div className="frame-2" />
        </div>

        {/* 4. Lộ trình cá nhân */}
        <div className="overlap-17">
          <p className="text-wrapper-47">Học tập theo lộ trình cá nhân hóa</p>
          <div className="text-wrapper-48">7.8</div>
          <div className="text-wrapper-49">Điểm đã dự đoán</div>

          <div className="overlap-18">
            <div className="text-wrapper-50">Tiến độ học tập</div>
            <div className="text-wrapper-51">33% Complete</div>
            <div className="rectangle-wrapper">
              <div className="rectangle-32" />
            </div>
          </div>

          <div className="overlap-19">
            <div className="rectangle-33" />
            <div className="text-wrapper-52">Đánh giá năng lực</div>
            <div className="rectangle-34" />
            <p className="b-n-c-n-n-t-ng-kh-t">
              Bạn đã có nền tảng khá tốt với môn database ở học kì trước
              <br />
              Đối với học kì này bạn cần hoàn thành và nắm hết kiến thức theo lộ
              trình được đề xuất để đạt được điểm như dự đoán
            </p>
          </div>

          <div className="overlap-20">
            <div className="text-wrapper-53">5h</div>
            <p className="text-wrapper-54">Thời gian dành ra mỗi tuần</p>
          </div>

          <div className="overlap-21">
            <div className="text-wrapper-55">6 weeks</div>
            <div className="text-wrapper-56">Thời gian còn lại</div>
          </div>

          <div className="overlap-22">
            <div className="text-wrapper-57">45h</div>
            <div className="text-wrapper-58">Thời gian yêu cầu</div>
          </div>

          <div className="group-3">
            <div className="overlap-23">
              <button 
                className="text-wrapper-59"
                onClick={() => window.location.href = '/study-with-me'}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                Bắt đầu học
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
