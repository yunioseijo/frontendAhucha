import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsersService } from '@shared/api/users.service';
import { BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { ConfirmModalComponent } from '@shared/ui/confirm-modal.component';

@Component({
  selector: 'app-users-trash',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent],
  templateUrl: './users-trash.page.html',
  styleUrls: ['./users-trash.page.css'],
})
export class UsersTrashPage implements OnInit {
  private api = inject(UsersService);

  limit = 10;
  offset = 0;
  total = 0;
  list: any[] = [];
  readonly math = Math;
  q = '';
  role: '' | 'admin' | 'super-user' | 'user' = '';
  // reactive streams
  private q$ = new BehaviorSubject<string>('');
  private role$ = new BehaviorSubject<'' | 'admin' | 'super-user' | 'user'>('');
  private limit$ = new BehaviorSubject<number>(this.limit);
  private offset$ = new BehaviorSubject<number>(this.offset);

  vm$ = combineLatest([this.limit$, this.offset$, this.q$, this.role$]).pipe(
    switchMap(([limit, offset, q, role]) =>
      this.api
        .listDeleted(limit, offset, {
          q: q?.trim() || undefined,
          role: (role || undefined) as any,
        })
        .pipe(
          map((res) => ({
            total: res.total,
            data: [...res.data].sort((a, b) => {
              const da = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
              const db = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
              return db - da;
            }),
          }))
        )
    ),
    shareReplay(1)
  );

  private latestList: any[] = [];
  purgeAll = false;
  confirmStage: 0 | 1 = 0;

  showConfirm = false;
  pendingId: string | null = null;
  confirmHard = false;

  ngOnInit() {
    this.vm$.subscribe((vm) => {
      this.total = vm.total;
      this.list = vm.data;
    });
  }

  load() {
    this.offset$.next(this.offset);
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
    this.offset = 0;
    this.load();
  }
  onLimitChange() {
    this.offset = 0;
    this.limit$.next(this.limit);
    this.load();
  }
  // reflect text/role changes into streams
  set qModel(val: string) {
    this.q = val;
    this.q$.next(val);
    this.onFilters();
  }
  set roleModel(val: '' | 'admin' | 'super-user' | 'user') {
    this.role = val;
    this.role$.next(val);
    this.onFilters();
  }

  askRestore(id: string) {
    this.pendingId = id;
    this.confirmHard = false;
    this.purgeAll = false;
    this.confirmStage = 0;
    this.showConfirm = true;
  }
  askHardDelete(id: string) {
    this.pendingId = id;
    this.confirmHard = true;
    this.purgeAll = false;
    this.confirmStage = 0;
    this.showConfirm = true;
  }
  askPurgeAll() {
    this.pendingId = null;
    this.purgeAll = true;
    this.confirmHard = true;
    this.confirmStage = 0;
    this.showConfirm = true;
  }

  onConfirm() {
    if (this.purgeAll) {
      if (this.confirmStage === 0) {
        this.confirmStage = 1;
        this.showConfirm = true;
        return;
      }
      const ids = this.list.map((u) => u.id);
      this.showConfirm = false;
      forkJoin(ids.map((id) => this.api.purge(id))).subscribe({
        next: () => this.load(),
      });
      return;
    }
    if (!this.pendingId) return;
    const id = this.pendingId;
    this.pendingId = null;
    this.showConfirm = false;
    if (this.confirmHard)
      this.api.purge(id).subscribe({ next: () => this.load() });
    else this.api.restore(id).subscribe({ next: () => this.load() });
  }

  onCancel() {
    this.showConfirm = false;
    this.confirmStage = 0;
    this.purgeAll = false;
    this.pendingId = null;
  }
}
