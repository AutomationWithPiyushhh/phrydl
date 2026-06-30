import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        System.out.println("SuperAdmin@123: " + new BCryptPasswordEncoder().encode("SuperAdmin@123"));
        System.out.println("admin123: " + new BCryptPasswordEncoder().encode("admin123"));
        System.out.println("manager123: " + new BCryptPasswordEncoder().encode("manager123"));
        System.out.println("staff123: " + new BCryptPasswordEncoder().encode("staff123"));
        System.out.println("tenant123: " + new BCryptPasswordEncoder().encode("tenant123"));    }
}
