package dev.noorahmadi.quakescope.earthquake;

import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

import org.springframework.stereotype.Component;

@Component
public class IngestionExecutionGuard {

    private final ReentrantLock lock = new ReentrantLock();

    public <T> T execute(Supplier<T> action) {
        if (!lock.tryLock()) {
            throw new IngestionInProgressException();
        }
        try {
            return action.get();
        }
        finally {
            lock.unlock();
        }
    }
}
