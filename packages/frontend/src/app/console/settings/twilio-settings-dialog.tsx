import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const twilioFormSchema = z.object({
  accountSid: z.string().min(1, 'Account SID is required'),
  authToken: z.string().min(1, 'Auth Token is required'),
  phoneNumber: z.string().min(1, 'Phone Number is required'),
});

type TwilioFormValues = z.infer<typeof twilioFormSchema>;

interface TwilioSettingsDialogProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: TwilioFormValues | null;
}

export function TwilioSettingsDialog({
  agentId,
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: TwilioSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TwilioFormValues>({
    resolver: zodResolver(twilioFormSchema),
    defaultValues: initialData || {
      accountSid: '',
      authToken: '',
      phoneNumber: '',
    },
  });

  async function onSubmit(data: TwilioFormValues) {
    try {
      setIsLoading(true);
      await api.post(`/${agentId}/twilio`, data);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving Twilio settings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Twilio Settings</DialogTitle>
          <DialogDescription>
            Configure Twilio settings for your agent. These settings are required for phone-based interactions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountSid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account SID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Twilio Account SID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Twilio Auth Token"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Twilio Phone Number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}