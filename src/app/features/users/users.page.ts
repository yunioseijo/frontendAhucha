import { Component, OnInit, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { UsersStore } from './data/users.store';
import type { UserRole } from '@shared/models/roles';

import { UsersService } from '@shared/api/users.service';
import { ConfirmModalComponent } from '@shared/ui/confirm-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
  ],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css'],
})
export class UsersPage implements OnInit {
  private store = inject(UsersStore);
  private api = inject(UsersService);
  private fb = inject(FormBuilder);
  private syncTotal = effect(() => {
    this.total = this.store.total();
  });

  limit = 10;
  offset = 0;
  total = 0;
  // filter inputs (bound via ngModel)
  search = '';
  role: '' | UserRole = '';
  status: '' | 'active' | 'inactive' = '';
  // server-side list passthrough
  list = computed(() => this.store.list());
  readonly math = Math;

  // create form
  showCreate = false;
  showConfirm = false;
  pendingDeleteId: string | null = null;
  createForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    this.load();
  }

  private buildFilters() {
    return {
      q: this.search?.trim() || undefined,
      role: (this.role || undefined) as import('@shared/models/roles').UserRole | undefined,
      isActive: this.status === '' ? undefined : this.status === 'active',
      // emailVerified not exposed in UI for now
    };
  }

  load() {
    this.store.load(this.limit, this.offset, this.buildFilters());
    this.total = this.store.total();
  }
  next() {
    this.offset = Math.min(
      this.offset + this.limit,
      Math.max(0, this.total - this.limit)
    );
    this.load();
  }
  prev() {
    this.offset = Math.max(0, this.offset - this.limit);
    this.load();
  }

  onFilters() {
    // Reset pagination on filter change and load from backend
    this.offset = 0;
    this.load();
  }

  toggleCreate() {
    this.showCreate = !this.showCreate;
  }
  createUser() {
    if (this.createForm.invalid) return;
    this.store.create(
      this.createForm.getRawValue(),
      this.limit,
      this.offset,
      this.buildFilters()
    );
    this.showCreate = false;
    this.createForm.reset();
  }

  deleteUser(id: string) {
    this.pendingDeleteId = id;
    this.showConfirm = true;
  }
  onConfirmDelete() {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    this.showConfirm = false;
    this.api.remove(id).subscribe({ next: () => this.load() });
  }
}
