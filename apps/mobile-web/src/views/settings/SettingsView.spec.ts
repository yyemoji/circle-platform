import{fireEvent,render,screen}from'@testing-library/vue';import{createPinia,setActivePinia}from'pinia';import{beforeEach,describe,expect,it,vi}from'vitest';import SettingsView from'./SettingsView.vue';

vi.mock('vue-router',()=>({useRouter:()=>({push:vi.fn()})}));

describe('SettingsView',()=>{beforeEach(()=>setActivePinia(createPinia()));it('requires confirmation before logout',async()=>{render(SettingsView);await fireEvent.click(screen.getByRole('button',{name:'退出登录'}));expect(screen.getByRole('dialog')).toBeTruthy();expect(screen.getByText('确认退出当前账号？')).toBeTruthy();});});
