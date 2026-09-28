using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net;
using System.Runtime.InteropServices;

namespace WinSentinel
{
    public enum WtsConnectState
    {
        Active = 0,
        Connected = 1,
        ConnectQuery = 2,
        Shadow = 3,
        Disconnected = 4,
        Idle = 5,
        Listen = 6,
        Reset = 7,
        Down = 8,
        Init = 9
    }

    public enum WtsInfoClass
    {
        UserName = 5,
        DomainName = 7,
        ClientAddress = 14,
        ClientProtocolType = 16
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct WtsSessionInfo
    {
        public int SessionId;
        public IntPtr WinStationName;
        public WtsConnectState State;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct WtsClientAddress
    {
        public int AddressFamily;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 20)]
        public byte[] Address;
    }

    public sealed class RemoteSession
    {
        public int SessionId { get; set; }
        public string SessionName { get; set; }
        public string State { get; set; }
        public string UserName { get; set; }
        public string DomainName { get; set; }
        public string ClientReportedAddress { get; set; }
    }

    public static class NativeWts
    {
        [DllImport("wtsapi32.dll", EntryPoint = "WTSEnumerateSessionsW", CharSet = CharSet.Unicode, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool WTSEnumerateSessionsW(IntPtr server, int reserved, int version, out IntPtr sessionInfo, out int count);

        [DllImport("wtsapi32.dll", EntryPoint = "WTSQuerySessionInformationW", CharSet = CharSet.Unicode, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool WTSQuerySessionInformationW(IntPtr server, int sessionId, WtsInfoClass infoClass, out IntPtr buffer, out int bytesReturned);

        [DllImport("wtsapi32.dll", SetLastError = false)]
        private static extern void WTSFreeMemory(IntPtr memory);

        private static IntPtr Query(int sessionId, WtsInfoClass infoClass, out int bytesReturned)
        {
            IntPtr buffer;
            if (!WTSQuerySessionInformationW(IntPtr.Zero, sessionId, infoClass, out buffer, out bytesReturned))
            {
                int error = Marshal.GetLastWin32Error();
                throw new Win32Exception(error, "Unable to query a local Remote Desktop session.");
            }
            return buffer;
        }

        private static string QueryString(int sessionId, WtsInfoClass infoClass)
        {
            int bytes;
            IntPtr buffer = Query(sessionId, infoClass, out bytes);
            try
            {
                return buffer == IntPtr.Zero ? null : Marshal.PtrToStringUni(buffer);
            }
            finally
            {
                if (buffer != IntPtr.Zero) WTSFreeMemory(buffer);
            }
        }

        private static int QueryProtocol(int sessionId)
        {
            int bytes;
            IntPtr buffer = Query(sessionId, WtsInfoClass.ClientProtocolType, out bytes);
            try
            {
                if (buffer == IntPtr.Zero || bytes < sizeof(short))
                    throw new InvalidOperationException("Windows returned no client protocol for a session.");
                return unchecked((ushort)Marshal.ReadInt16(buffer));
            }
            finally
            {
                if (buffer != IntPtr.Zero) WTSFreeMemory(buffer);
            }
        }

        private static string QueryClientAddress(int sessionId)
        {
            int bytes;
            IntPtr buffer;
            if (!WTSQuerySessionInformationW(IntPtr.Zero, sessionId, WtsInfoClass.ClientAddress, out buffer, out bytes))
                return null;
            try
            {
                if (buffer == IntPtr.Zero || bytes < Marshal.SizeOf(typeof(WtsClientAddress)))
                    return null;
                WtsClientAddress clientAddress = (WtsClientAddress)Marshal.PtrToStructure(buffer, typeof(WtsClientAddress));
                int addressLength;
                if (clientAddress.AddressFamily == 2) addressLength = 4;
                else if (clientAddress.AddressFamily == 23) addressLength = 16;
                else return null;

                if (clientAddress.Address == null || clientAddress.Address.Length < addressLength + 2)
                    return null;

                byte[] address = new byte[addressLength];
                Array.Copy(clientAddress.Address, 2, address, 0, addressLength);
                return new IPAddress(address).ToString();
            }
            finally
            {
                if (buffer != IntPtr.Zero) WTSFreeMemory(buffer);
            }
        }

        public static RemoteSession[] EnumerateRemoteSessions()
        {
            IntPtr buffer;
            int count;
            if (!WTSEnumerateSessionsW(IntPtr.Zero, 0, 1, out buffer, out count))
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Unable to enumerate local sessions.");

            var sessions = new List<RemoteSession>();
            try
            {
                int itemSize = Marshal.SizeOf(typeof(WtsSessionInfo));
                for (int index = 0; index < count; index++)
                {
                    IntPtr item = IntPtr.Add(buffer, index * itemSize);
                    WtsSessionInfo info = (WtsSessionInfo)Marshal.PtrToStructure(item, typeof(WtsSessionInfo));
                    if (info.State != WtsConnectState.Active && info.State != WtsConnectState.Connected && info.State != WtsConnectState.Disconnected)
                        continue;
                    if (QueryProtocol(info.SessionId) != 2)
                        continue;

                    sessions.Add(new RemoteSession
                    {
                        SessionId = info.SessionId,
                        SessionName = info.WinStationName == IntPtr.Zero ? null : Marshal.PtrToStringUni(info.WinStationName),
                        State = info.State.ToString(),
                        UserName = QueryString(info.SessionId, WtsInfoClass.UserName),
                        DomainName = QueryString(info.SessionId, WtsInfoClass.DomainName),
                        ClientReportedAddress = QueryClientAddress(info.SessionId)
                    });
                }
            }
            finally
            {
                if (buffer != IntPtr.Zero) WTSFreeMemory(buffer);
            }
            return sessions.ToArray();
        }
    }
}