import { Admin, IAdmin } from '../../models/Admin';

// get admin by providing IAdmin
export async function getAdmin(admin: IAdmin): Promise<IAdmin> {
  //check for missign fields
  if (!admin.name || !admin.phoneNumber || !admin.assignedDay || !admin.roomNumber || !admin.houseNumber) {
    throw new Error('Please fill all fields');
  }

  const foundAdmin = await Admin.find({
    name: admin.name,
    phoneNumber: admin.phoneNumber,
    assignedDay: admin.assignedDay,
    roomNumber: admin.roomNumber,
    houseNumber: admin.houseNumber,
  });
  if (!foundAdmin) {
    throw new Error('Admin not found');
  }
  return admin;
}

// add an admin
export async function addAdmin(admin: IAdmin): Promise<IAdmin> {
  // check if all fields are filled
  if (!admin.name || !admin.phoneNumber || !admin.assignedDay || !admin.roomNumber || !admin.houseNumber) {
    throw new Error('Please fill all fields');
  }

  // check if assignedDay is a valid day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!days.includes(admin.assignedDay)) {
    throw new Error('Please enter a valid day');
  }

  // check if admin already exists
  const existingAdmin = await Admin.findOne({
    name: admin.name,
    phoneNumber: admin.phoneNumber,
    assignedDay: admin.assignedDay,
    roomNumber: admin.roomNumber,
    houseNumber: admin.houseNumber,
  });

  if (existingAdmin) {
    throw new Error('Admin already exists');
  }

  try {
    // mongoose save admin to db
    const newAdmin = new Admin(admin);
    const savedAdmin = await newAdmin.save();
    return savedAdmin.toObject();
  } catch (err) {
    throw new Error(err);
  }
}

// delete an admin
export async function deleteAdmin(admin: IAdmin): Promise<IAdmin> {
  const existingAdmin = await Admin.findOne({
    name: admin.name,
    phoneNumber: admin.phoneNumber,
    assignedDay: admin.assignedDay,
    roomNumber: admin.roomNumber,
    houseNumber: admin.houseNumber,
  });
  if (!existingAdmin) {
    throw new Error('Admin does not exist');
  }
  try {
    const deletedAdmin = await Admin.findOneAndDelete({
      name: admin.name,
      phoneNumber: admin.phoneNumber,
      assignedDay: admin.assignedDay,
      roomNumber: admin.roomNumber,
      houseNumber: admin.houseNumber,
    });
    if (!deletedAdmin) {
      throw new Error('Admin does not exist');
    }
    return deletedAdmin.toObject();
  } catch (err) {
    throw new Error(err);
  }
}

// get all admins
export async function getAllAdmins(): Promise<IAdmin[]> {
  try {
    // mongoose get all admins from db
    const admins = await Admin.find({});
    return admins.map(admin => admin.toObject());
  } catch (err) {
    throw new Error(err);
  }
}

// get all admins assigned to a day
// each admin is assigned to a day like Monday, Tuesday, Wednesday, etc.
export async function getAdminByAssignedDay(assignedDay: string): Promise<IAdmin[]> {
  // check if assignedDay is a valid day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!days.includes(assignedDay)) {
    throw new Error('Please enter a valid day');
  }

  try {
    // mongoose get admin by assigned day from db
    const admins = await Admin.find({ assignedDay });
    return admins.map(admin => admin.toObject() as IAdmin);
  } catch (err) {
    throw new Error(err);
  }
}

// Returns an array containing the names of any missing required fields.
function findMissingFields(admin: IAdmin): string[] {
  const requiredFields = ['name', 'phoneNumber', 'assignedDay', 'roomNumber', 'houseNumber'];
  const missingFields = requiredFields.filter(field => admin[field] === null || admin[field] === undefined);
  return missingFields;
}

// Edits an existing admin object by replacing the oldAdmin with the newAdmin.
// Both oldAdmin and newAdmin should have the same shape.
// Returns a Promise that resolves with the updated IAdmin object.
export async function editAdmin(oldAdmin: IAdmin, newAdmin: IAdmin): Promise<IAdmin> {
  // Check for any missing fields in the newAdmin object.
  const missingFieldsNew = findMissingFields(newAdmin);

  // If there are any missing fields, throw an error listing all the missing fields.
  if (missingFieldsNew.length > 0) {
    throw new Error('Missing fields of newAdmin: ' + missingFieldsNew.join(', '));
  }

  const missingFieldsOld = findMissingFields(oldAdmin);

  if (missingFieldsOld.length > 0) {
    throw new Error('Missing fields of oldAdmin: ' + missingFieldsOld.join(', '));
  }

  const existingOldAdmin = await Admin.findOne({
    name: oldAdmin.name,
    phoneNumber: oldAdmin.phoneNumber,
    assignedDay: oldAdmin.assignedDay,
    roomNumber: oldAdmin.roomNumber,
    houseNumber: oldAdmin.houseNumber,
  });

  if (!existingOldAdmin) {
    throw new Error('Admin does not exist');
  }

  const isSameAdmin =
    oldAdmin.name === newAdmin.name &&
    oldAdmin.phoneNumber === newAdmin.phoneNumber &&
    oldAdmin.assignedDay === newAdmin.assignedDay &&
    oldAdmin.roomNumber === newAdmin.roomNumber &&
    oldAdmin.houseNumber === newAdmin.houseNumber;

  if (!isSameAdmin) {
    const existingAdmin = await Admin.findOne({
      name: newAdmin.name,
      phoneNumber: newAdmin.phoneNumber,
      assignedDay: newAdmin.assignedDay,
      roomNumber: newAdmin.roomNumber,
      houseNumber: newAdmin.houseNumber,
    });

    if (existingAdmin) {
      throw new Error('Admin already exists');
    }
  }

  try {
    const updatedAdmin = await Admin.findOneAndUpdate(
      {
        name: oldAdmin.name,
        phoneNumber: oldAdmin.phoneNumber,
        assignedDay: oldAdmin.assignedDay,
        roomNumber: oldAdmin.roomNumber,
        houseNumber: oldAdmin.houseNumber,
      },
      newAdmin,
      { new: true }
    );
    if (!updatedAdmin) {
      throw new Error('Admin does not exist');
    }
    return updatedAdmin.toObject();
  } catch (err) {
    throw new Error(err);
  }
}
