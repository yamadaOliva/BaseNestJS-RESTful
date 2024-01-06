import { PrismaService } from './prisma.service';
const prisma = new PrismaService();
async function main() {
  interface ProgramInfo {
    name: string;
    acronym: string;
  }

  //delete all data

  const programs: ProgramInfo[] = [
    { name: 'Kỹ thuật Cơ điện tử', acronym: 'ME1' },
    { name: 'Kỹ thuật Cơ khí', acronym: 'ME2' },
    { name: 'Kỹ thuật Ô tô', acronym: 'TE1' },
    { name: 'Kỹ thuật Cơ khí động lực', acronym: 'TE2' },
    { name: 'Kỹ thuật Hàng không', acronym: 'TE3' },
    { name: 'Chương trình tiên tiến Cơ điện tử', acronym: 'ME-E1' },
    { name: 'Chương trình tiên tiến Kỹ thuật Ô tô', acronym: 'TE-E2' },
    { name: 'Kỹ thuật Điện', acronym: 'EE1' },
    { name: 'Kỹ thuật Điều khiển và Tự động hóa', acronym: 'EE2' },
    {
      name: 'Chương trình tiên tiến Điều khiển-Tự động hóa và Hệ thống điện',
      acronym: 'EE-E8',
    },
    { name: 'Kỹ thuật Điện tử - Viễn thông', acronym: 'ET1' },
    { name: 'Chương trình tiên tiến Điện tử - Viễn thông', acronym: 'ET-E4' },
    { name: 'Chương trình tiên tiến Kỹ thuật Y sinh', acronym: 'ET-E5' },
    {
      name: 'Chương trình đào tạo Hệ thống nhúng thông minh và IoT',
      acronym: 'ET-E9',
    },
    { name: 'CNTT: Khoa học Máy tính', acronym: 'IT1' },
    { name: 'CNTT: Kỹ thuật Máy tính', acronym: 'IT2' },
    {
      name: 'Chương trình tiên tiến Khoa học Dữ liệu và Trí tuệ Nhân tạo',
      acronym: 'IT-E10',
    },
    { name: 'Công nghệ thông tin Việt-Nhật', acronym: 'IT-E6' },
    { name: 'Công nghệ thông tin Global ICT', acronym: 'IT-E7' },
    { name: 'Toán-Tin', acronym: 'MI1' },
    { name: 'Hệ thống thông tin quản lý', acronym: 'MI2' },
    { name: 'Kỹ thuật Hóa học', acronym: 'CH1' },
    { name: 'Hóa học', acronym: 'CH2' },
    { name: 'Kỹ thuật in', acronym: 'CH3' },
    { name: 'Chương trình tiên tiến Kỹ thuật Hóa dược', acronym: 'CH-E11' },
    { name: 'Kỹ thuật Sinh học', acronym: 'BF1' },
    { name: 'Kỹ thuật Thực phẩm', acronym: 'BF2' },
    { name: 'Chương trình tiên tiến Kỹ thuật Thực phẩm', acronym: 'BF-E12' },
    { name: 'Kỹ thuật Môi trường', acronym: 'EV1' },
    { name: 'Kỹ thuật Vật liệu', acronym: 'MS1' },
    {
      name: 'Chương trình tiên tiến Kỹ thuật Vật liệu (Vật liệu thông minh và Nano)',
      acronym: 'MS-E3',
    },
    { name: 'Kỹ thuật Nhiệt', acronym: 'HE1' },
    { name: 'Kỹ thuật Dệt - May', acronym: 'TX1' },
    { name: 'Vật lý kỹ thuật', acronym: 'PH1' },
    { name: 'Kỹ thuật hạt nhân', acronym: 'PH2' },
    { name: 'Công nghệ giáo dục', acronym: 'ED2' },
    { name: 'Kinh tế công nghiệp', acronym: 'EM1' },
    { name: 'Quản lý công nghiệp', acronym: 'EM2' },
    { name: 'Quản trị kinh doanh', acronym: 'EM3' },
    { name: 'Kế toán', acronym: 'EM4' },
    { name: 'Tài chính - Ngân hàng', acronym: 'EM5' },
    { name: 'Chuyên ngành tiên tiến Phân tích Kinh doanh', acronym: 'EM-E13' },
    { name: 'Tiếng Anh Khoa học Kỹ thuật & Công nghệ', acronym: 'FL1' },
    { name: 'Tiếng Anh chuyên nghiệp Quốc tế', acronym: 'FL2' },
    { name: 'Cơ điện tử - ĐH Nagaoka (Nhật Bản)', acronym: 'ME-NUT' },
    { name: 'Cơ khí-Chế tạo máy - ĐH Griffith (Úc)', acronym: 'ME-GU' },
    { name: 'Cơ điện tử - ĐH Leibniz Hannover (Đức)', acronym: 'ME-LUH' },
    {
      name: 'Điện tử-Viễn thông - ĐH Leibniz Hannover (Đức)',
      acronym: 'ET-LUH',
    },
    { name: 'Công nghệ thông tin - ĐH La Trobe (Úc)', acronym: 'IT-LTU' },
    {
      name: 'Công nghệ thông tin - ĐH Victoria (New Zealand)',
      acronym: 'IT-VUW',
    },
    { name: 'Hệ thống thông tin - ĐH Grenoble (Pháp)', acronym: 'IT-GINP' },
    {
      name: 'Quản trị kinh doanh - ĐH Victoria (New Zealand)',
      acronym: 'EM-VUW',
    },
    {
      name: 'Quản lý công nghiệp-Logistics và Quản lý chuỗi cung ứng - ĐH Northampton (Anh)',
      acronym: 'EM-NU',
    },
    { name: 'Quản trị kinh doanh - ĐH Troy (Hoa Kỳ)', acronym: 'TROY-BA' },
    { name: 'Khoa học máy tính - ĐH Troy (Hoa Kỳ)', acronym: 'TROY-IT' },
  ];

  const classCount = [];
  for (let i = 0; i < programs.length; i++) {
    for (let j = 0; j < 5; j++) {
      classCount.push({
        majorId: i + 1,
        schoolYear: 2019 + j,
        count: 5,
      });
    }
  }
  try {
    await prisma.user.deleteMany();
    await prisma.major.deleteMany();
    await prisma.major.createMany({
      data: programs,
    });
    await prisma.classCount.createMany({
      data: classCount,
    });
  } catch (error) {
    console.log(error);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
