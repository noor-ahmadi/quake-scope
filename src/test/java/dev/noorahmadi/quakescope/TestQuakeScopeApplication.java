package dev.noorahmadi.quakescope;

import org.springframework.boot.SpringApplication;

public class TestQuakeScopeApplication {

	public static void main(String[] args) {
		SpringApplication.from(QuakeScopeApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
