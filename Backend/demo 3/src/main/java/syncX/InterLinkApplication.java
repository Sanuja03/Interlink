package syncX;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EntityScan("syncX.modules")
@EnableJpaRepositories("syncX.modules")
public class InterLinkApplication {

	public static void main(String[] args) {

		System.out.println("DB_PASSWORD = " + System.getenv("DB_PASSWORD"));
		SpringApplication.run(InterLinkApplication.class, args);

	}
}