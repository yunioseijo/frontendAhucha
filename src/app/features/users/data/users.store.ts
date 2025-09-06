import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { UsersService } from '@shared/api/users.service';
import { User } from '@shared/models/user.domain';
import { mapUserDtoToDomain } from '@shared/api/mappers/user.mapper';
import { CreateUserDto } from '@shared/api/types.gen';

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private api = inject(UsersService);

  private loadingSig = signal(false);
  private totalSig = signal(0);
  private listSig = signal<User[]>([]);

  readonly loading = computed(() => this.loadingSig());
  readonly total = computed(() => this.totalSig());
  readonly list: Signal<User[]> = computed(() => this.listSig());

  load(limit = 10, offset = 0) {
    this.loadingSig.set(true);
    this.api.list(limit, offset).subscribe({
      next: (res) => {
        this.totalSig.set(res.total);
        this.listSig.set(res.data.map(mapUserDtoToDomain));
        this.loadingSig.set(false);
      },
      error: () => this.loadingSig.set(false)
    });
  }

  create(payload: CreateUserDto, limit = 10, offset = 0) {
    this.loadingSig.set(true);
    this.api.create(payload).subscribe({
      next: () => this.load(limit, offset),
      error: () => this.loadingSig.set(false)
    });
  }
}
