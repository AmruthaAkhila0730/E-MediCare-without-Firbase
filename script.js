// Sample data
let users = [
    {
        id: '1',
        name: 'Mr. Ramana',
        email: 'admin@example.com',
        role: 'admin',
        password: 'admin123'
    }
];

let consultations = [

];

// DOM Elements

const adminAddDoctorForm = document.getElementById('admin-add-doctor-form');
const adminDoctorName = document.getElementById('admin-doctor-name');
const adminDoctorEmail = document.getElementById('admin-doctor-email');
const adminDoctorPassword = document.getElementById('admin-doctor-password');


const authView = document.getElementById('auth-view');
const mainView = document.getElementById('main-view');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const authTitle = document.getElementById('auth-title');
const logoutBtn = document.getElementById('logout-btn');
const currentUserName = document.getElementById('current-user-name');
const currentUserRole = document.getElementById('current-user-role');
const adminDashboard = document.getElementById('admin-dashboard');
const doctorDashboard = document.getElementById('doctor-dashboard');
const patientDashboard = document.getElementById('patient-dashboard');
const doctorsList = document.getElementById('doctors-list');
const adminConsultationsList = document.getElementById('admin-consultations-list');
const doctorConsultationsList = document.getElementById('doctor-consultations-list');
const patientConsultationsList = document.getElementById('patient-consultations-list');
const bookingForm = document.getElementById('booking-form');
const bookingDoctor = document.getElementById('booking-doctor');
const bookingDay = document.getElementById('booking-day');
const bookingTime = document.getElementById('booking-time');
const addAvailabilityBtn = document.getElementById('add-availability-btn');
const doctorAvailabilityList = document.getElementById('doctor-availability-list');

const adminBookingForm = document.getElementById('admin-booking-form');
const adminPatient = document.getElementById('admin-patient');
const adminDoctor = document.getElementById('admin-doctor');
const adminDay = document.getElementById('admin-day');
const adminTime = document.getElementById('admin-time');



// Current user
let currentUser = null;

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper function to toggle visibility
function toggleElement(element, show) {
    if (show) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

// Event Listeners
switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    toggleElement(loginForm, false);
    toggleElement(registerForm, true);
    authTitle.textContent = 'Register';
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    toggleElement(registerForm, false);
    toggleElement(loginForm, true);
    authTitle.textContent = 'Login';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        loginUser();
    } else {
        alert('Invalid credentials');
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;


    if (users.some(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    const newUser = {
        id: `${users.length + 1}`,
        name,
        email,
        role,
        password
    };

    // Add availability array for doctors
    if (role === 'doctor') {
        newUser.availability = [];
    }

    users.push(newUser);
    currentUser = newUser;
    loginUser();
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    toggleElement(authView, true);
    toggleElement(mainView, false);
    loginForm.reset();
    registerForm.reset();
    toggleElement(loginForm, true);
    toggleElement(registerForm, false);
    authTitle.textContent = 'Login';
});

bookingDoctor.addEventListener('change', (e) => {
    const doctorId = e.target.value;
    if (!doctorId) {
        bookingDay.disabled = true;
        bookingDay.innerHTML = '<option value="">Select a day</option>';
        bookingTime.disabled = true;
        bookingTime.innerHTML = '<option value="">Select a time</option>';
        return;
    }

    const doctor = users.find(u => u.id === doctorId && u.role === 'doctor');
    if (!doctor || !doctor.availability || doctor.availability.length === 0) {
        alert('This doctor has not set any availability yet');
        bookingDay.disabled = true;
        bookingDay.innerHTML = '<option value="">Select a day</option>';
        bookingTime.disabled = true;
        bookingTime.innerHTML = '<option value="">Select a time</option>';
        return;
    }

    // Populate days
    bookingDay.disabled = false;
    bookingDay.innerHTML = '<option value="">Select a day</option>';
    const availableDays = [...new Set(doctor.availability.map(a => a.day))];
    availableDays.forEach(day => {
        bookingDay.innerHTML += `<option value="${day}">${day}</option>`;
    });
});

bookingDay.addEventListener('change', (e) => {
    const day = e.target.value;
    const doctorId = bookingDoctor.value;

    if (!day || !doctorId) {
        bookingTime.disabled = true;
        bookingTime.innerHTML = '<option value="">Select a time</option>';
        return;
    }

    const doctor = users.find(u => u.id === doctorId && u.role === 'doctor');
    const dayAvailability = doctor.availability.find(a => a.day === day);

    if (!dayAvailability || dayAvailability.times.length === 0) {
        bookingTime.disabled = true;
        bookingTime.innerHTML = '<option value="">No times available</option>';
        return;
    }

    // Populate times
    bookingTime.disabled = false;
    bookingTime.innerHTML = '<option value="">Select a time</option>';

    // Filter out already booked times
    const bookedTimes = consultations
        .filter(c => c.doctorId === doctorId && c.status === 'upcoming')
        .map(c => c.time);

    dayAvailability.times.forEach(time => {
        if (!bookedTimes.includes(time)) {
            bookingTime.innerHTML += `<option value="${time}">${time}</option>`;
        }
    });

    if (bookingTime.options.length === 1) {
        bookingTime.innerHTML = '<option value="">No available times left</option>';
        bookingTime.disabled = true;
    }
});

bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const doctorId = bookingDoctor.value;
    const day = bookingDay.value;
    const time = bookingTime.value;

    if (!doctorId || !day || !time) {
        alert('Please fill all fields');
        return;
    }

    // Find the next available date for the selected day
    const today = new Date();
    let date = new Date(today);

    // Find the next occurrence of the selected day
    while (date.toLocaleDateString('en-US', { weekday: 'long' }) !== day) {
        date.setDate(date.getDate() + 1);
    }

    const formattedDate = date.toISOString().split('T')[0];

    const newConsultation = {
        id: `${consultations.length + 1}`,
        doctorId,
        patientId: currentUser.id,
        date: formattedDate,
        time,
        status: 'upcoming'
    };

    consultations.push(newConsultation);
    bookingForm.reset();
    bookingDay.disabled = true;
    bookingDay.innerHTML = '<option value="">Select a day</option>';
    bookingTime.disabled = true;
    bookingTime.innerHTML = '<option value="">Select a time</option>';
    renderDashboard();
    alert('Consultation booked successfully!');
});

addAvailabilityBtn.addEventListener('click', () => {
    if (!currentUser || currentUser.role !== 'doctor') return;

    // Add a new availability entry
    if (!currentUser.availability) {
        currentUser.availability = [];
    }

    currentUser.availability.push({
        day: 'Monday',
        times: []
    });

    renderDoctorAvailability();
});

// Functions
function loginUser() {
    toggleElement(authView, false);
    toggleElement(mainView, true);
    currentUserName.textContent = currentUser.name;
    currentUserRole.textContent = currentUser.role;
    currentUserRole.className = `badge role-badge ${currentUser.role === 'admin' ? 'bg-danger' :
        currentUser.role === 'doctor' ? 'bg-primary' : 'bg-success'
        }`;

    renderDashboard();
}

function renderDashboard() {
    // Hide all dashboards first
    toggleElement(adminDashboard, false);
    toggleElement(doctorDashboard, false);
    toggleElement(patientDashboard, false);

    // Show the appropriate dashboard
    if (currentUser.role === 'admin') {
        toggleElement(adminDashboard, true);
        renderAdminDashboard();
    } else if (currentUser.role === 'doctor') {
        toggleElement(doctorDashboard, true);
        renderDoctorDashboard();
    } else if (currentUser.role === 'patient') {
        toggleElement(patientDashboard, true);
        renderPatientDashboard();
    }
}



adminDoctor.addEventListener('change', (e) => {
    const doctorId = e.target.value;
    const doctor = users.find(u => u.id === doctorId && u.role === 'doctor');

    if (!doctor || !doctor.availability?.length) {
        adminDay.innerHTML = '<option value="">Select a day</option>';
        adminDay.disabled = true;
        adminTime.innerHTML = '<option value="">Select a time</option>';
        adminTime.disabled = true;
        return;
    }

    adminDay.innerHTML = '<option value="">Select a day</option>';
    const availableDays = [...new Set(doctor.availability.map(a => a.day))];
    availableDays.forEach(day => {
        adminDay.innerHTML += `<option value="${day}">${day}</option>`;
    });
    adminDay.disabled = false;
});

adminDay.addEventListener('change', (e) => {
    const doctorId = adminDoctor.value;
    const selectedDay = e.target.value;
    const doctor = users.find(u => u.id === doctorId && u.role === 'doctor');

    const availability = doctor.availability.find(a => a.day === selectedDay);
    if (!availability) {
        adminTime.innerHTML = '<option value="">No times available</option>';
        adminTime.disabled = true;
        return;
    }

    // Filter out already booked times
    const bookedTimes = consultations
        .filter(c => c.doctorId === doctorId && c.status === 'upcoming')
        .map(c => c.time);

    adminTime.innerHTML = '<option value="">Select a time</option>';
    availability.times.forEach(time => {
        if (!bookedTimes.includes(time)) {
            adminTime.innerHTML += `<option value="${time}">${time}</option>`;
        }
    });

    if (adminTime.options.length === 1) {
        adminTime.innerHTML = '<option value="">No available times left</option>';
        adminTime.disabled = true;
    } else {
        adminTime.disabled = false;
    }
});

adminBookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const patientName = document.getElementById('admin-patient-name').value.trim();
    const doctorId = adminDoctor.value;
    const day = adminDay.value;
    const time = adminTime.value;

    if (!patientName || !doctorId || !day || !time) {
        alert('Please fill all fields');
        return;
    }

    const today = new Date();
    let date = new Date(today);
    while (date.toLocaleDateString('en-US', { weekday: 'long' }) !== day) {
        date.setDate(date.getDate() + 1);
    }
    const formattedDate = date.toISOString().split('T')[0];

    const newConsultation = {
        id: `${consultations.length + 1}`,
        doctorId,
        patientId: `guest-${consultations.length + 1}`,
        patientName,
        date: formattedDate,
        time,
        status: 'upcoming'
    };

    consultations.push(newConsultation);
    adminBookingForm.reset();
    adminDay.disabled = true;
    adminTime.disabled = true;
    renderDashboard();
    alert('Consultation booked by admin successfully!');
});

function renderAdminDashboard() {
    // Render doctors with remove option
    doctorsList.innerHTML = '';
    const doctorUsers = users.filter(u => u.role === 'doctor');
    doctorUsers.forEach(doctor => {
        doctorsList.innerHTML += `
          <div class="col-md-4 mb-3">
            <div class="card consultation-card h-100 doctor-card">
              <button class="btn btn-sm btn-danger remove-doctor-btn" data-id="${doctor.id}">
                <i class="bi bi-trash"></i>
              </button>
              <div class="card-body">
                <h5 class="card-title">${doctor.name}</h5>
                <p class="card-text text-muted">${doctor.email}</p>
                <p class="card-text"><strong>Specialty:</strong> ${doctor.specialty}</p>
                <p class="card-text"><small>Availability: ${doctor.availability?.length || 0} days</small></p>
              </div>
            </div>
          </div>
        `;
    });

    document.querySelectorAll('.remove-doctor-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const doctorId = e.target.closest('button').dataset.id;
            if (confirm(`Are you sure you want to remove this doctor and all their consultations?`)) {
                users = users.filter(u => u.id !== doctorId);
                consultations = consultations.filter(c => c.doctorId !== doctorId);
                renderAdminDashboard();
            }
        });
    });

    adminConsultationsList.innerHTML = '';
    consultations.forEach(consultation => {
        const doctor = users.find(u => u.id === consultation.doctorId);
        const patient = users.find(u => u.id === consultation.patientId);
        const patientName = patient ? patient.name : consultation.patientName || 'Unknown';
        // const patientDisplayName = patient?.name || consultation.patientName || 'Unknown';

        adminConsultationsList.innerHTML += `
          <div class="card consultation-card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">${doctor?.name} with ${patientName}</h5>
                  <p class="card-text text-muted">
                    <i class="bi bi-calendar-event me-1"></i>${consultation.date} 
                    <i class="bi bi-clock ms-2 me-1"></i>${consultation.time}
                  </p>
                </div>
                <div>
                  <span class="badge ${consultation.status === 'upcoming' ? 'bg-primary' :
                consultation.status === 'completed' ? 'bg-success' : 'bg-secondary'
            } me-2">${consultation.status}</span>
                  ${consultation.status === 'upcoming' ?
                `<button class="btn btn-sm btn-outline-danger cancel-consultation" data-id="${consultation.id}">Cancel</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
    });

    document.querySelectorAll('.cancel-consultation').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const consultationId = e.target.dataset.id;
            if (confirm('Are you sure you want to cancel this consultation?')) {
                const consultationIndex = consultations.findIndex(c => c.id === consultationId);
                if (consultationIndex !== -1) {
                    consultations[consultationIndex].status = 'cancelled';
                    renderAdminDashboard();
                }
            }
        });
    });

    // Only populate doctor dropdown
    adminDoctor.innerHTML = '<option value="">Select a doctor</option>';
    users.filter(u => u.role === 'doctor').forEach(doctor => {
        adminDoctor.innerHTML += `<option value="${doctor.id}">${doctor.name} (${doctor.specialty})</option>`;
    });
}

adminAddDoctorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = adminDoctorName.value.trim();
    const email = adminDoctorEmail.value.trim();
    const password = adminDoctorPassword.value.trim();

    if (!name || !email || !password) {
        alert('All fields are required');
        return;
    }

    if (users.some(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    const specialty = document.getElementById('doctor-specialty').value;
    const newDoctor = {
        id: `${users.length + 1}`,
        name,
        email,
        password,
        role: 'doctor',
        specialty,
        availability: []
    };


    users.push(newDoctor);
    adminAddDoctorForm.reset();
    renderAdminDashboard();
    alert('Doctor added successfully!');
});

function renderDoctorDashboard() {
    // Render availability
    renderDoctorAvailability();

    // Render consultations
    doctorConsultationsList.innerHTML = '';
    const doctorConsultations = consultations.filter(c => c.doctorId === currentUser.id);

    doctorConsultations.forEach(consultation => {
        const patient = users.find(u => u.id === consultation.patientId);
        const patientName = patient ? patient.name : consultation.patientName || 'Unknown';

        doctorConsultationsList.innerHTML += `
          <div class="card consultation-card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">Consultation with ${patientName}</h5>
                  <p class="card-text text-muted">
                    <i class="bi bi-calendar-event me-1"></i>${consultation.date} 
                    <i class="bi bi-clock ms-2 me-1"></i>${consultation.time}
                  </p>
                </div>
                <div>
                  <span class="badge ${consultation.status === 'upcoming' ? 'bg-primary' :
                consultation.status === 'completed' ? 'bg-success' : 'bg-secondary'
            } me-2">${consultation.status}</span>
                  </div>
              </div>
            </div>
          </div>
        `;
    });

    // Add event listeners for start consultation buttons
    document.querySelectorAll('.start-consultation').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const consultationId = e.target.dataset.id;
            alert(`Starting consultation ${consultationId}`);
            // In a real app, this would launch the consultation
        });
    });
}

function renderDoctorAvailability() {
    if (!currentUser || !currentUser.availability) {
        doctorAvailabilityList.innerHTML = '<p>No availability set yet</p>';
        return;
    }

    doctorAvailabilityList.innerHTML = '';

    currentUser.availability.forEach((availability, index) => {
        const availabilityElement = document.createElement('div');
        availabilityElement.className = 'availability-day mb-3 p-3';

        availabilityElement.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${availability.day}</h6>
            <button class="btn btn-sm btn-outline-danger remove-availability" data-index="${index}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="mb-2">
            <select class="form-select form-select-sm day-select" data-index="${index}">
              ${daysOfWeek.map(day =>
            `<option value="${day}" ${day === availability.day ? 'selected' : ''}>${day}</option>`
        ).join('')}
            </select>
          </div>
          <div class="times-container mb-2" data-index="${index}">
            ${availability.times.map(time => `
              <span class="time-slot badge bg-light text-dark">
                ${time}
                <button class="btn btn-sm p-0 ms-1 remove-time" data-index="${index}" data-time="${time}">
                  <i class="bi bi-x"></i>
                </button>
              </span>
            `).join('')}
          </div>
          <div class="d-flex">
            <input type="time" class="form-control form-control-sm me-2 new-time" data-index="${index}" step="3600">
            <button class="btn btn-sm btn-outline-primary add-time" data-index="${index}">Add Time</button>
          </div>
        `;

        doctorAvailabilityList.appendChild(availabilityElement);
    });

    // Add event listeners for the dynamically created elements
    document.querySelectorAll('.remove-availability').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            currentUser.availability.splice(index, 1);
            renderDoctorAvailability();
        });
    });

    document.querySelectorAll('.day-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            currentUser.availability[index].day = e.target.value;
        });
    });

    document.querySelectorAll('.add-time').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const timeInput = document.querySelector(`.new-time[data-index="${index}"]`);
            const time = timeInput.value;

            if (!time) {
                alert('Please select a time');
                return;
            }

            if (!currentUser.availability[index].times.includes(time)) {
                currentUser.availability[index].times.push(time);
                currentUser.availability[index].times.sort();
                renderDoctorAvailability();
            }

            timeInput.value = '';
        });
    });

    document.querySelectorAll('.remove-time').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            const time = e.target.closest('button').dataset.time;
            currentUser.availability[index].times = currentUser.availability[index].times.filter(t => t !== time);
            renderDoctorAvailability();
        });
    });
}

function renderPatientDashboard() {
    // Render patient's consultations
    patientConsultationsList.innerHTML = '';
    const patientConsultations = consultations.filter(c => c.patientId === currentUser.id);

    patientConsultations.forEach(consultation => {
        const doctor = users.find(u => u.id === consultation.doctorId);

        patientConsultationsList.innerHTML += `
          <div class="card consultation-card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">Consultation with ${doctor?.name}</h5>
                  <p class="card-text text-muted">
                    <i class="bi bi-calendar-event me-1"></i>${consultation.date} 
                    <i class="bi bi-clock ms-2 me-1"></i>${consultation.time}
                  </p>
                </div>
                <div>
                  <span class="badge ${consultation.status === 'upcoming' ? 'bg-primary' :
                consultation.status === 'completed' ? 'bg-success' : 'bg-secondary'
            } me-2">${consultation.status}</span>
                   </div>
              </div>
            </div>
          </div>
        `;
    });


    // Populate doctors dropdown for booking
    bookingDoctor.innerHTML = '<option value="">Select a doctor</option>';
    const doctorUsers = users.filter(u => u.role === 'doctor');
    doctorUsers.forEach(doctor => {
        bookingDoctor.innerHTML += `<option value="${doctor.id}">${doctor.name} (${doctor.specialty})</option>`;
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    toggleElement(mainView, false);
    toggleElement(loginForm, true);
    toggleElement(registerForm, false);
});