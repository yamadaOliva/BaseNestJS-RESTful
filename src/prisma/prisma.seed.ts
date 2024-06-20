import { PrismaService } from './prisma.service';
const prisma = new PrismaService();
import * as argon from 'argon2';
interface StudentRecord {
  name: string;
  studentId: string;
  email: string;
}

function generateVietnameseName(): string {
  const lastNames = [
    'Nguyễn',
    'Trần',
    'Lê',
    'Phạm',
    'Huỳnh',
    'Hoàng',
    'Phan',
    'Vũ',
    'Đặng',
    'Bùi',
  ];
  const middleNames = [
    'Văn',
    'Thị',
    'Hữu',
    'Minh',
    'Thanh',
    'Công',
    'Xuân',
    'Đình',
    'Ngọc',
    'Thế',
  ];
  const firstNames = [
    'Anh',
    'Bình',
    'Chi',
    'Dũng',
    'Em',
    'Phúc',
    'Giang',
    'Hương',
    'Khôi',
    'Lan',
  ];

  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middleName =
    middleNames[Math.floor(Math.random() * middleNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

  return `${lastName} ${middleName} ${firstName}`;
}

function generateStudentId(): string {
  const schoolYears = ['2017', '2018', '2019', '2020', '2021'];
  return (
    schoolYears[Math.floor(Math.random() * schoolYears.length)] +
    `${Math.floor(1000 + Math.random() * 9000).toString()}`
  );
}

function removeVietnameseTones(str: string): string {
  const accentsMap = {
    a: 'àáạảãâầấậẩẫăằắặẳẵ',
    e: 'èéẹẻẽêềếệểễ',
    i: 'ìíịỉĩ',
    o: 'òóọỏõôồốộổỗơờớợởỡ',
    u: 'ùúụủũưừứựửữ',
    y: 'ỳýỵỷỹ',
    d: 'đ',
    A: 'ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ',
    E: 'ÈÉẸẺẼÊỀẾỆỂỄ',
    I: 'ÌÍỊỈĨ',
    O: 'ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ',
    U: 'ÙÚỤỦŨƯỪỨỰỬỮ',
    Y: 'ỲÝỴỶỸ',
    D: 'Đ',
  };

  for (let regex in accentsMap) {
    const chars = accentsMap[regex];
    for (let char of chars) {
      str = str.replace(new RegExp(char, 'g'), regex);
    }
  }

  return str;
}

function generateEmail(name: string, studentId: string): string {
  const nameParts = name.split(' ');
  const lastName = removeVietnameseTones(nameParts[0]).toLowerCase();
  const middleNameInitial = removeVietnameseTones(
    nameParts[1][0],
  ).toLowerCase();
  const firstName = removeVietnameseTones(
    nameParts[nameParts.length - 1],
  ).toLowerCase();
  const shortStudentId = studentId.slice(2);
  return `${firstName}.${lastName[0]}${middleNameInitial}${shortStudentId}@sis.hust.edu.vn`;
}

function generateStudentRecords(count: number): StudentRecord[] {
  const records: StudentRecord[] = [];

  for (let i = 0; i < count; i++) {
    const name = generateVietnameseName();
    const studentId = generateStudentId();
    const email = generateEmail(name, studentId);

    records.push({
      name,
      studentId,
      email,
    });
  }

  return records;
}

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
    { name: 'ADMIN', acronym: 'ADMIN' },
  ];
  const programsSortedByName = programs.slice().sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  const classCount = [];
  for (let i = 0; i < programs.length; i++) {
    for (let j = 0; j < 7; j++) {
      classCount.push({
        majorId: i + 1,
        schoolYear: 2024 - j,
        count: 5,
      });
    }
  }
  try {
    await prisma.major.deleteMany();
    await prisma.classCount.deleteMany();
    await prisma.major.createMany({
      data: programsSortedByName,
    });
    await prisma.classCount.createMany({
      data: classCount,
    });
  } catch (error) {
    console.log(error);
  }
  const idMajor = await prisma.major.findFirst({
    where: {
      acronym: 'ADMIN',
    },
  });
  await prisma.user.deleteMany();
  const studentRecords = generateStudentRecords(100);
  const gender = ['Nam', 'Nữ', 'Khác'];
  try {
    //admin
    const password = 'admin123456';
    await prisma.user.create({
      data: {
        email: 'adminBK@sis.hust.edu.vn',
        name: 'Đại học Bách Khoa Hà Nội',
        studentId: 'admin',
        password: await argon.hash(password),
        role: 'ADMIN',
        Birthday: new Date(),
        avatarUrl:
          'https://res.cloudinary.com/subarasuy/image/upload/v1716135390/prvieraqcydb8ehxjf8x.png',
        majorId: idMajor.id,
        class: 'ADMIN',
        statusAccount: 'ACTIVE',
        city: 'Thành phố Hà Nội',
        district: 'Quận Hai Bà Trưng',
      },
    });

    const promises = studentRecords.map((record) => {
      const majorId = Math.floor(Math.random() * programs.length) + 1;
      return prisma.user.create({
        data: {
          email: record.email,
          name: record.name,
          studentId: record.studentId,
          password:
            '$argon2id$v=19$m=65536,t=3,p=4$h09a+TwvFzGorR/XtyM4eA$j1AX+ogfgxpM+couvseOK/wEusWAtJWtEzEy70Kzgqc',
          role: 'USER',
          Birthday: new Date(),
          avatarUrl:
            'https://res.cloudinary.com/subarasuy/image/upload/v1716135390/prvieraqcydb8ehxjf8x.png',
          majorId: majorId,
          class:
            programs[majorId - 1].acronym +
            ' ' +
            Math.floor(Math.random() * 5 + 1).toString(),
          statusAccount: 'ACTIVE',
          city: 'Thành phố Hà Nội',
          district: 'Quận Hai Bà Trưng',
          gender: gender[Math.floor(Math.random() * 3)],
          interest: ['Khoa học', 'Kỹ thuật', 'Thể thao'],
          schoolYear: parseInt(record.studentId.slice(0, 4)),
          liveIn: 'KTX A1',
          phone: '0123456789',
        },
      });
    });
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
