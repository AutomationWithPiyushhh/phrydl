package com.phrydlpg.core.common.seeder;

import com.github.javafaker.Faker;
import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import com.phrydlpg.core.rooms.entity.Bed;
import com.phrydlpg.core.rooms.entity.Room;
import com.phrydlpg.core.rooms.repository.BedRepository;
import com.phrydlpg.core.rooms.repository.RoomRepository;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import com.phrydlpg.core.users.entity.Role;
import com.phrydlpg.core.users.entity.User;
import com.phrydlpg.core.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.phrydlpg.core.payments.entity.Payment;
import com.phrydlpg.core.payments.repository.PaymentRepository;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import com.phrydlpg.core.complaints.entity.Complaint;
import com.phrydlpg.core.complaints.repository.ComplaintRepository;
import com.phrydlpg.core.expenses.entity.Expense;
import com.phrydlpg.core.expenses.repository.ExpenseRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.springframework.context.annotation.Profile;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final TenantRepository tenantRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ComplaintRepository complaintRepository;
    private final ExpenseRepository expenseRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping Faker seeding.");
            return;
        }

        logger.info("Starting Data Seeding...");
        
        Random random = new Random(42);
        Faker faker = new Faker(random);

        // Required Role Users
        User superAdmin = User.builder()
                .email("superadmin@phrydlpg.com")
                .password(passwordEncoder.encode("SuperAdmin@123"))
                .firstName("Super")
                .lastName("Admin")
                .role(Role.SUPER_ADMIN)
                .build();

        User admin = User.builder()
                .email("admin")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Platform")
                .lastName("Admin")
                .role(Role.ADMIN)
                .build();

        User manager = User.builder()
                .email("manager")
                .password(passwordEncoder.encode("manager123"))
                .firstName("Property")
                .lastName("Manager")
                .role(Role.MANAGER)
                .build();

        User staff = User.builder()
                .email("staff")
                .password(passwordEncoder.encode("staff123"))
                .firstName("Support")
                .lastName("Staff")
                .role(Role.STAFF)
                .build();

        User tenantDemo = User.builder()
                .email("tenant")
                .password(passwordEncoder.encode("tenant123"))
                .firstName("Demo")
                .lastName("Tenant")
                .role(Role.TENANT)
                .build();

        userRepository.saveAll(List.of(superAdmin, admin, manager, staff, tenantDemo));

        // Create 10 Specific Ahmedabad Properties
        String[] propertyNames = {
            "PhrydlPG Prahlad Nagar", "PhrydlPG SG Highway", "PhrydlPG Gota",
            "PhrydlPG Chandkheda", "PhrydlPG Navrangpura", "PhrydlPG Vastrapur",
            "PhrydlPG Science City", "PhrydlPG Bodakdev", "PhrydlPG Satellite",
            "PhrydlPG Thaltej"
        };
        
        List<Property> properties = new ArrayList<>();
        for (String name : propertyNames) {
            String slug = name.toLowerCase().replace("phrydlpg ", "").replace(" ", "-") + "-premium-pg";
            Property prop = Property.builder()
                    .name(name)
                    .address(name + ", Ahmedabad, Gujarat")
                    .slug(slug)
                    .capacity(70) // 70 beds per property = 700 beds total
                    .type("Co-living")
                    .contactPhone("+91 9876543210")
                    .whatsappNumber("+91 9876543210")
                    .amenities(List.of("High-Speed WiFi", "Nutritious Food", "Daily Housekeeping", "24/7 Security", "Biometric Access", "Washing Machine"))
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                            "https://images.unsplash.com/photo-1502672260266-1c1e52409818?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    ))
                    .manager(admin)
                    .build();
            properties.add(propertyRepository.save(prop));
        }

        // Create Rooms and Beds
        List<Bed> availableBeds = new ArrayList<>();
        for (Property prop : properties) {
            int roomCount = prop.getCapacity() / 2; // 35 rooms per property (2-sharing)
            for (int i = 1; i <= roomCount; i++) {
                Room room = Room.builder()
                        .property(prop)
                        .roomNumber(String.format("%03d-%s", i, (char)('A' + random.nextInt(3))))
                        .type("2-Sharing")
                        .build();
                room = roomRepository.save(room);

                for (int j = 1; j <= 2; j++) {
                    Bed bed = Bed.builder()
                            .room(room)
                            .bedNumber("B" + j)
                            .build();
                    availableBeds.add(bedRepository.save(bed));
                }
            }
        }

        // Add the Demo Tenant
        if (!availableBeds.isEmpty()) {
            Bed demoBed = availableBeds.remove(0);
            Tenant tenantObj = Tenant.builder()
                    .user(tenantDemo)
                    .bed(demoBed)
                    .tenantCode("T-DEMO")
                    .kycStatus("VERIFIED")
                    .leaseStart(LocalDate.now().minusMonths(6))
                    .leaseEnd(LocalDate.now().plusMonths(6))
                    .monthlyRent(BigDecimal.valueOf(12000))
                    .securityDeposit(BigDecimal.valueOf(24000))
                    .status("ACTIVE")
                    .build();
            tenantRepository.save(tenantObj);
            demoBed.setStatus("OCCUPIED");
            bedRepository.save(demoBed);
        }

        String[] gujaratiNames = {
            "Meet Patel", "Dhruv Shah", "Yash Patel", "Harsh Panchal", "Jay Mehta",
            "Krunal Desai", "Jinal Shah", "Hetvi Patel", "Priyanshi Trivedi", "Riya Modi",
            "Devang Joshi", "Parth Bhatt", "Keval Patel", "Nirav Shah", "Maulik Desai",
            "Aarti Joshi", "Bhavik Gandhi", "Chirag Thakkar", "Darshan Patel", "Esha Shah"
        };

        String[] companies = {"TCS", "Infosys", "TatvaSoft", "Simform", "eInfochips", "Cognizant", "Accenture", "Gateway Group", "Hidden Brains"};
        String[] colleges = {"Nirma University", "PDEU", "DAIICT", "LJ University", "Ahmedabad University", "Gujarat University"};
        String[] occupations = {"IT Employee", "Engineering Student", "MBA Student", "Intern", "Software Tester", "Developer", "Data Analyst", "UI/UX Designer"};

        // Create 500 Realistic Tenants
        int tenantCount = 0;
        List<Tenant> allTenants = new ArrayList<>();
        for (int i = 0; i < 500; i++) {
            if (availableBeds.isEmpty()) break;
            Bed bed = availableBeds.remove(0);

            String fullName = gujaratiNames[random.nextInt(gujaratiNames.length)];
            String[] parts = fullName.split(" ");
            String first = parts[0];
            String last = parts[1];

            User user = User.builder()
                    .email(first.toLowerCase() + "." + last.toLowerCase() + i + "@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName(first)
                    .lastName(last)
                    .phoneNumber("+91 " + (9000000000L + random.nextInt(1000000000)))
                    .role(Role.TENANT)
                    .build();
            user = userRepository.save(user);

            boolean isStudent = random.nextBoolean();
            String occ = isStudent ? colleges[random.nextInt(colleges.length)] : companies[random.nextInt(companies.length)];
            
            Tenant tenant = Tenant.builder()
                    .user(user)
                    .bed(bed)
                    .tenantCode("T-AHD-" + (1000 + tenantCount))
                    .kycStatus(random.nextDouble() > 0.1 ? "VERIFIED" : "PENDING")
                    .leaseStart(LocalDate.now().minusMonths(random.nextInt(12)))
                    .leaseEnd(LocalDate.now().plusMonths(random.nextInt(12) + 1))
                    .monthlyRent(BigDecimal.valueOf(8000 + random.nextInt(10000))) // Rent between 8k and 18k
                    .securityDeposit(BigDecimal.valueOf(16000 + random.nextInt(20000)))
                    .status(random.nextDouble() > 0.05 ? "ACTIVE" : "NOTICE")
                    .emergencyContact("+91 " + (8000000000L + random.nextInt(1000000000)))
                    .permanentAddress(faker.address().fullAddress())
                    .occupation(isStudent ? "Student" : "IT Professional")
                    .employerOrCollege(occ)
                    .age(18 + random.nextInt(12)) // 18 to 29
                    .build();
            allTenants.add(tenantRepository.save(tenant));
            
            bed.setStatus("OCCUPIED");
            bedRepository.save(bed);
            tenantCount++;
        }

        // Seed 2000 Invoices and Payments
        List<com.phrydlpg.core.payments.entity.Invoice> allInvoices = new ArrayList<>();
        for (int i = 0; i < 2000; i++) {
            Tenant t = allTenants.get(random.nextInt(allTenants.size()));
            com.phrydlpg.core.payments.entity.Invoice inv = com.phrydlpg.core.payments.entity.Invoice.builder()
                    .invoiceNumber("INV" + System.currentTimeMillis() + "-" + i)
                    .tenant(t)
                    .property(t.getBed().getRoom().getProperty())
                    .billingMonth("2026-0" + (1 + random.nextInt(6))) // Jan-Jun
                    .amount(t.getMonthlyRent())
                    .totalAmount(t.getMonthlyRent())
                    .dueDate(LocalDate.now().minusDays(random.nextInt(180)))
                    .status(com.phrydlpg.core.payments.entity.InvoiceStatus.PAID)
                    .build();
            allInvoices.add(inv);
        }
        allInvoices = invoiceRepository.saveAll(allInvoices);
        
        for (int i = 0; i < allInvoices.size(); i++) {
            com.phrydlpg.core.payments.entity.Invoice inv = allInvoices.get(i);
            Payment p = Payment.builder()
                    .invoice(inv)
                    .amount(inv.getTotalAmount())
                    .type("RENT")
                    .method(random.nextBoolean() ? "UPI" : "BANK_TRANSFER")
                    .status(com.phrydlpg.core.payments.entity.PaymentStatus.SUCCESS)
                    .transactionRef("TXN" + System.currentTimeMillis() + "-" + i)
                    .paymentDate(LocalDateTime.now().minusDays(random.nextInt(180)))
                    .build();
            paymentRepository.save(p);
        }
        // Seed 150 Complaints
        String[] complaintTitles = {"AC not working", "Water leakage", "Wi-Fi extremely slow", "Cleaning not done", "Geyser issue"};
        for (int i = 0; i < 150; i++) {
            Tenant t = allTenants.get(random.nextInt(allTenants.size()));
            Complaint c = Complaint.builder()
                    .tenant(t)
                    .property(t.getBed().getRoom().getProperty())
                    .ticketRef("TKT-" + (1000 + i))
                    .title(complaintTitles[random.nextInt(complaintTitles.length)])
                    .description("Detailed description of the issue faced by the tenant.")
                    .priority(random.nextBoolean() ? "High" : "Medium")
                    .status(random.nextBoolean() ? "RESOLVED" : (random.nextBoolean() ? "IN_PROGRESS" : "OPEN"))
                    .build();
            complaintRepository.save(c);
        }

        // Seed 400 Expenses
        String[] expenseCategories = {"Maintenance", "Electricity", "Water", "Salaries", "Internet", "Miscellaneous"};
        for (int i = 0; i < 400; i++) {
            Property p = properties.get(random.nextInt(properties.size()));
            Expense e = Expense.builder()
                    .property(p)
                    .title("Monthly " + expenseCategories[random.nextInt(expenseCategories.length)])
                    .category(expenseCategories[random.nextInt(expenseCategories.length)])
                    .amount(BigDecimal.valueOf(1000 + random.nextInt(20000)))
                    .status("PAID")
                    .expenseDate(LocalDate.now().minusDays(random.nextInt(180)))
                    .description("Routine expense for property.")
                    .build();
            expenseRepository.save(e);
        }

        logger.info("Successfully seeded users, {} properties, {} tenants, 2000 payments, 150 complaints, 400 expenses.", properties.size(), tenantCount);
    }
}
