import { PrismaService } from './prisma.service';

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
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
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
    a: "àáạảãâầấậẩẫăằắặẳẵ",
    e: "èéẹẻẽêềếệểễ",
    i: "ìíịỉĩ",
    o: "òóọỏõôồốộổỗơờớợởỡ",
    u: "ùúụủũưừứựửữ",
    y: "ỳýỵỷỹ",
    d: "đ",
    A: "ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ",
    E: "ÈÉẸẺẼÊỀẾỆỂỄ",
    I: "ÌÍỊỈĨ",
    O: "ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ",
    U: "ÙÚỤỦŨƯỪỨỰỬỮ",
    Y: "ỲÝỴỶỸ",
    D: "Đ",
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
  const middleNameInitial = removeVietnameseTones(nameParts[1][0]).toLowerCase();
  const firstName = removeVietnameseTones(nameParts[nameParts.length - 1]).toLowerCase();
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

const studentRecords = generateStudentRecords(100);
console.log(JSON.stringify(studentRecords, null, 2));
